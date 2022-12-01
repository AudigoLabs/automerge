use crate::error::AutomergeError;
use crate::op_tree::OpTreeNode;
use crate::query::{QueryResult, TreeQuery};
use crate::types::{ElemId, Key, Op, HEAD};
use std::fmt::Debug;

#[derive(Debug, Clone, PartialEq)]
pub(crate) struct InsertNth {
    /// the index in the realised list that we want to insert at
    target: usize,
    /// the number of visible operations seen
    seen: usize,
    seen8: usize,
    last_width: usize,
    utf16: bool,
    //pub pos: usize,
    /// the number of operations (including non-visible) that we have seen
    n: usize,
    valid: Option<usize>,
    /// last_seen is the target elemid of the last `seen` operation.
    /// It is used to avoid double counting visible elements (which arise through conflicts) that are split across nodes.
    last_seen: Option<Key>,
    last_insert: Option<ElemId>,
    last_valid_insert: Option<Key>,
}

impl InsertNth {
    pub(crate) fn new(target: usize, utf16: bool) -> Self {
        let (valid, last_valid_insert) = if target == 0 {
            (Some(0), Some(Key::Seq(HEAD)))
        } else {
            (None, None)
        };
        InsertNth {
            // seen and target are both in the "native" units (utf8/utf16)
            // if in utf8 mode seen8 just shadows the value
            // if in utf16 mode seen will be utf16 and seen8 will be utf8
            target,
            seen: 0,
            seen8: 0,
            last_width: 0,
            utf16,
            n: 0,
            valid,
            last_seen: None,
            last_insert: None,
            last_valid_insert,
        }
    }

    pub(crate) fn index_utf8(&self) -> usize {
        self.seen8
    }

    pub(crate) fn index_utf16(&self) -> usize {
        // if in utf8 mode this just returns utf8
        self.seen
    }

    pub(crate) fn pos(&self) -> usize {
        self.valid.unwrap_or(self.n)
    }

    pub(crate) fn key(&self) -> Result<Key, AutomergeError> {
        self.last_valid_insert
            .ok_or(AutomergeError::InvalidIndex(self.target))
    }
}

impl<'a> TreeQuery<'a> for InsertNth {
    fn query_node(&mut self, child: &OpTreeNode) -> QueryResult {
        // if this node has some visible elements then we may find our target within
        let mut num_vis = child.index.visible_len(self.utf16);
        let mut num_vis8 = child.index.visible_len(false);
        if let Some(last_seen) = self.last_seen {
            if child.index.has_visible(&last_seen) {
                num_vis -= 1;
                num_vis8 -= 1;
            }
        }

        if self.seen + num_vis >= self.target {
            // our target is within this node
            QueryResult::Descend
        } else {
            // our target is not in this node so try the next one
            self.n += child.len();
            self.seen += num_vis;
            self.seen8 += num_vis8;

            // We have updated seen by the number of visible elements in this index, before we skip it.
            // We also need to keep track of the last elemid that we have seen (and counted as seen).
            // We can just use the elemid of the last op in this node as either:
            // - the insert was at a previous node and this is a long run of overwrites so last_seen should already be set correctly
            // - the visible op is in this node and the elemid references it so it can be set here
            // - the visible op is in a future node and so it will be counted as seen there
            let last_elemid = child.last().elemid_or_key();
            if child.index.has_visible(&last_elemid) {
                self.last_seen = Some(last_elemid);
            }
            QueryResult::Next
        }
    }

    fn query_element(&mut self, element: &Op) -> QueryResult {
        if element.insert {
            if self.valid.is_none() && self.seen >= self.target {
                self.valid = Some(self.n);
            }
            self.last_seen = None;
            self.last_insert = element.elemid();
        }
        if self.last_seen.is_none() && element.visible() {
            if self.seen >= self.target {
                return QueryResult::Finish;
            }
            self.last_width = element.width(self.utf16);
            self.seen += self.last_width;
            self.seen8 += 1;
            self.last_seen = Some(element.elemid_or_key());
            self.last_valid_insert = self.last_seen
        }
        self.n += 1;
        QueryResult::Next
    }
}
