use crate::exid::ExId;
use crate::{Automerge, ChangeHash, KeysAt, Prop, Value};
use crate::{AutomergeError, Keys};

use super::{CommitOptions, Transactable, TransactionInner};

/// A transaction on a document.
/// Transactions group operations into a single change so that no other operations can happen
/// in-between.
///
/// Created from [`Automerge::transaction`].
///
/// ## Drop
///
/// This transaction should be manually committed or rolled back. If not done manually then it will
/// be rolled back when it is dropped. This is to prevent the document being in an unsafe
/// intermediate state.
/// This is consistent with `?` error handling.
#[derive(Debug)]
pub struct Transaction<'a> {
    // this is an option so that we can take it during commit and rollback to prevent it being
    // rolled back during drop.
    pub(crate) inner: Option<TransactionInner>,
    pub(crate) doc: &'a mut Automerge,
}

impl<'a> Transaction<'a> {
    /// Get the heads of the document before this transaction was started.
    pub fn get_heads(&self) -> Vec<ChangeHash> {
        self.doc.get_heads()
    }

    /// Commit the operations performed in this transaction, returning the hashes corresponding to
    /// the new heads.
    pub fn commit(mut self) -> Vec<ChangeHash> {
        self.inner.take().unwrap().commit(self.doc, None, None)
    }

    /// Commit the operations in this transaction with some options.
    ///
    /// ```
    /// # use automerge::transaction::CommitOptions;
    /// # use automerge::transaction::Transactable;
    /// # use automerge::Value;
    /// # use automerge::ROOT;
    /// # use automerge::Automerge;
    /// # use std::time::SystemTime;
    /// let mut doc = Automerge::new();
    /// let mut tx = doc.transaction();
    /// tx.set(&ROOT, "todos", Value::list()).unwrap();
    /// let now = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_secs() as
    /// i64;
    /// tx.commit_with(CommitOptions::default().with_message("Create todos list").with_time(now));
    /// ```
    pub fn commit_with(mut self, options: CommitOptions) -> Vec<ChangeHash> {
        self.inner
            .take()
            .unwrap()
            .commit(self.doc, options.message, options.time)
    }

    /// Undo the operations added in this transaction, returning the number of cancelled
    /// operations.
    pub fn rollback(mut self) -> usize {
        self.inner.take().unwrap().rollback(self.doc)
    }
}

impl<'a> Transactable for Transaction<'a> {
    /// Get the number of pending operations in this transaction.
    fn pending_ops(&self) -> usize {
        self.inner.as_ref().unwrap().pending_ops()
    }

    /// Set the value of property `P` to value `V` in object `obj`.
    ///
    /// # Returns
    ///
    /// The opid of the operation which was created, or None if this operation doesn't change the
    /// document
    ///
    /// # Errors
    ///
    /// This will return an error if
    /// - The object does not exist
    /// - The key is the wrong type for the object
    /// - The key does not exist in the object
    fn set<P: Into<Prop>, V: Into<Value>>(
        &mut self,
        obj: &ExId,
        prop: P,
        value: V,
    ) -> Result<Option<ExId>, AutomergeError> {
        self.inner.as_mut().unwrap().set(self.doc, obj, prop, value)
    }

    fn insert<V: Into<Value>>(
        &mut self,
        obj: &ExId,
        index: usize,
        value: V,
    ) -> Result<Option<ExId>, AutomergeError> {
        self.inner
            .as_mut()
            .unwrap()
            .insert(self.doc, obj, index, value)
    }

    fn inc<P: Into<Prop>>(
        &mut self,
        obj: &ExId,
        prop: P,
        value: i64,
    ) -> Result<(), AutomergeError> {
        self.inner.as_mut().unwrap().inc(self.doc, obj, prop, value)
    }

    fn del<P: Into<Prop>>(&mut self, obj: &ExId, prop: P) -> Result<(), AutomergeError> {
        self.inner.as_mut().unwrap().del(self.doc, obj, prop)
    }

    /// Splice new elements into the given sequence. Returns a vector of the OpIds used to insert
    /// the new elements
    fn splice(
        &mut self,
        obj: &ExId,
        pos: usize,
        del: usize,
        vals: Vec<Value>,
    ) -> Result<Vec<ExId>, AutomergeError> {
        self.inner
            .as_mut()
            .unwrap()
            .splice(self.doc, obj, pos, del, vals)
    }

    fn keys(&self, obj: &ExId) -> Keys {
        self.doc.keys(obj)
    }

    fn keys_at(&self, obj: &ExId, heads: &[ChangeHash]) -> KeysAt {
        self.doc.keys_at(obj, heads)
    }

    fn length(&self, obj: &ExId) -> usize {
        self.doc.length(obj)
    }

    fn length_at(&self, obj: &ExId, heads: &[ChangeHash]) -> usize {
        self.doc.length_at(obj, heads)
    }

    fn text(&self, obj: &ExId) -> Result<String, AutomergeError> {
        self.doc.text(obj)
    }

    fn text_at(&self, obj: &ExId, heads: &[ChangeHash]) -> Result<String, AutomergeError> {
        self.doc.text_at(obj, heads)
    }

    fn value<P: Into<Prop>>(
        &self,
        obj: &ExId,
        prop: P,
    ) -> Result<Option<(Value, ExId)>, AutomergeError> {
        self.doc.value(obj, prop)
    }

    fn value_at<P: Into<Prop>>(
        &self,
        obj: &ExId,
        prop: P,
        heads: &[ChangeHash],
    ) -> Result<Option<(Value, ExId)>, AutomergeError> {
        self.doc.value_at(obj, prop, heads)
    }

    fn values<P: Into<Prop>>(
        &self,
        obj: &ExId,
        prop: P,
    ) -> Result<Vec<(Value, ExId)>, AutomergeError> {
        self.doc.values(obj, prop)
    }

    fn values_at<P: Into<Prop>>(
        &self,
        obj: &ExId,
        prop: P,
        heads: &[ChangeHash],
    ) -> Result<Vec<(Value, ExId)>, AutomergeError> {
        self.doc.values_at(obj, prop, heads)
    }
}

// If a transaction is not commited or rolled back manually then it can leave the document in an
// intermediate state.
// This defaults to rolling back the transaction to be compatible with `?` error returning before
// reaching a call to `commit`.
impl<'a> Drop for Transaction<'a> {
    fn drop(&mut self) {
        if let Some(txn) = self.inner.take() {
            txn.rollback(self.doc);
        }
    }
}
