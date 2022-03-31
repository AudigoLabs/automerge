use crate::clock::Clock;
use crate::query::TreeQuery;
use crate::types::ObjId;
use crate::types::Op;
use crate::ObjType;
use crate::{query::Keys, query::KeysAt, ObjType};

use crate::op_tree::{OpSetMetadata, OpTreeInternal};

#[derive(Debug, Clone, Copy, PartialEq)]
pub(crate) enum MapType {
    Map,
    Table,
}

impl From<MapType> for ObjType {
    fn from(m: MapType) -> Self {
        match m {
            MapType::Map => ObjType::Map,
            MapType::Table => ObjType::Table,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub(crate) enum SeqType {
    List,
    Text,
}

impl From<SeqType> for ObjType {
    fn from(s: SeqType) -> Self {
        match s {
            SeqType::List => ObjType::List,
            SeqType::Text => ObjType::Text,
        }
    }
}

/// Stores the data for an object.
#[derive(Debug, Clone, PartialEq)]
pub(crate) struct ObjectData {
    internal: ObjectDataInternal,
    /// The operations pertaining to this object.
    ops: OpTreeInternal,
    /// The id of the parent object, root has no parent.
    pub parent: Option<ObjId>,
}

#[derive(Debug, Clone, PartialEq)]
pub(crate) enum ObjectDataInternal {
    Map {
        /// The type of this object.
        typ: MapType,
    },
    Seq {
        /// The type of this object.
        typ: SeqType,
    },
}

impl ObjectData {
    pub fn root() -> Self {
        ObjectData {
            internal: ObjectDataInternal::Map { typ: MapType::Map },
            ops: Default::default(),
            parent: None,
        }
    }

    pub fn new(typ: ObjType, parent: Option<ObjId>) -> Self {
        let internal = match typ {
            ObjType::Map => ObjectDataInternal::Map { typ: MapType::Map },
            ObjType::Table => ObjectDataInternal::Map {
                typ: MapType::Table,
            },
            ObjType::List => ObjectDataInternal::Seq { typ: SeqType::List },
            ObjType::Text => ObjectDataInternal::Seq { typ: SeqType::Text },
        };
        ObjectData {
            internal,
            ops: Default::default(),
            parent,
        }
    }

    pub fn keys(&self) -> Option<Keys> {
        self.ops.keys()
    }

    pub fn keys_at(&self, clock: Clock) -> Option<KeysAt> {
        self.ops.keys_at(clock)
    }

    fn ops(&self) -> &OpTreeInternal {
        match self {
            ObjectData::Map { typ: _, ops } => ops,
            ObjectData::Seq { typ: _, ops } => ops,
        }
    }

    fn ops_mut(&mut self) -> &mut OpTreeInternal {
        match self {
            ObjectData::Map { typ: _, ops } => ops,
            ObjectData::Seq { typ: _, ops } => ops,
        }
    }

    pub fn search<Q>(&self, query: Q, metadata: &OpSetMetadata) -> Q
    where
        Q: TreeQuery,
    {
        self.ops().search(query, metadata)
    }

    pub fn replace<F>(&mut self, index: usize, f: F)
    where
        F: FnMut(&mut Op),
    {
        self.ops_mut().replace(index, f)
    }

    pub fn remove(&mut self, index: usize) -> Op {
        self.ops_mut().remove(index)
    }

    pub fn insert(&mut self, index: usize, op: Op) {
        self.ops_mut().insert(index, op)
    }

    pub fn typ(&self) -> ObjType {
        match self {
            ObjectData::Map { typ, ops: _ } => (*typ).into(),
            ObjectData::Seq { typ, ops: _ } => (*typ).into(),
        }
    }

    pub fn get(&self, index: usize) -> Option<&Op> {
        self.ops().get(index)
    }
}
