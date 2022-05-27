use crate::exid::ExId;
use crate::path::Path;
use crate::Prop;
use crate::Value;

/// An observer of operations applied to the document.
pub trait OpObserver {
    /// A new value has been inserted into the given object.
    ///
    /// - `obj`: the object that has been inserted into.
    /// - `index`: the index the new value has been inserted at.
    /// - `tagged_value`: the value that has been inserted and the id of the operation that did the
    /// insert.
    fn insert(&mut self, obj: ExId, path: Path<'_>, index: usize, tagged_value: (Value<'_>, ExId));

    /// A new value has been put into the given object.
    ///
    /// - `obj`: the object that has been put into.
    /// - `key`: the key that the value as been put at.
    /// - `tagged_value`: the value that has been put into the object and the id of the operation
    /// that did the put.
    /// - `conflict`: whether this put conflicts with other operations.
    fn put(
        &mut self,
        obj: ExId,
        path: Path<'_>,
        key: Prop,
        tagged_value: (Value<'_>, ExId),
        conflict: bool,
    );

    /// A counter has been incremented.
    ///
    /// - `obj`: the object that contains the counter.
    /// - `key`: they key that the chounter is at.
    /// - `tagged_value`: the amount the counter has been incremented by, and the the id of the
    /// increment operation.
    fn increment(&mut self, obj: ExId, path: Path<'_>, key: Prop, tagged_value: (i64, ExId));

    /// A value has beeen deleted.
    ///
    /// - `obj`: the object that has been deleted in.
    /// - `key`: the key of the value that has been deleted.
    fn delete(&mut self, obj: ExId, path: Path<'_>, key: Prop);
}

impl OpObserver for () {
    fn insert(
        &mut self,
        _obj: ExId,
        _path: Path<'_>,
        _index: usize,
        _tagged_value: (Value<'_>, ExId),
    ) {
    }

    fn put(
        &mut self,
        _obj: ExId,
        _path: Path<'_>,
        _key: Prop,
        _tagged_value: (Value<'_>, ExId),
        _conflict: bool,
    ) {
    }

    fn increment(&mut self, _obj: ExId, _path: Path<'_>, _key: Prop, _tagged_value: (i64, ExId)) {}

    fn delete(&mut self, _obj: ExId, _path: Path<'_>, _key: Prop) {}
}

/// Capture operations into a [`Vec`] and store them as patches.
#[derive(Default, Debug, Clone)]
pub struct VecOpObserver {
    patches: Vec<Patch>,
}

impl VecOpObserver {
    /// Take the current list of patches, leaving the internal list empty and ready for new
    /// patches.
    pub fn take_patches(&mut self) -> Vec<Patch> {
        std::mem::take(&mut self.patches)
    }
}

impl OpObserver for VecOpObserver {
    fn insert(
        &mut self,
        obj_id: ExId,
        path: Path<'_>,
        index: usize,
        (value, id): (Value<'_>, ExId),
    ) {
        let mut path = path.collect::<Vec<_>>();
        path.reverse();
        self.patches.push(Patch::Insert {
            obj: obj_id,
            path,
            index,
            value: (value.into_owned(), id),
        });
    }

    fn put(
        &mut self,
        obj: ExId,
        path: Path<'_>,
        key: Prop,
        (value, id): (Value<'_>, ExId),
        conflict: bool,
    ) {
        let mut path = path.collect::<Vec<_>>();
        path.reverse();
        self.patches.push(Patch::Put {
            obj,
            path,
            key,
            value: (value.into_owned(), id),
            conflict,
        });
    }

    fn increment(&mut self, obj: ExId, path: Path<'_>, key: Prop, tagged_value: (i64, ExId)) {
        let mut path = path.collect::<Vec<_>>();
        path.reverse();
        self.patches.push(Patch::Increment {
            obj,
            path,
            key,
            value: tagged_value,
        });
    }

    fn delete(&mut self, obj: ExId, path: Path<'_>, key: Prop) {
        let mut path = path.collect::<Vec<_>>();
        path.reverse();
        self.patches.push(Patch::Delete { obj, path, key })
    }
}

/// A notification to the application that something has changed in a document.
#[derive(Debug, Clone, PartialEq)]
pub enum Patch {
    /// Associating a new value with a key in a map, or an existing list element
    Put {
        /// The object that was put into.
        obj: ExId,
        path: Vec<Prop>,
        /// The key that the new value was put at.
        key: Prop,
        /// The value that was put, and the id of the operation that put it there.
        value: (Value<'static>, ExId),
        /// Whether this put conflicts with another.
        conflict: bool,
    },
    /// Inserting a new element into a list/text
    Insert {
        /// The object that was inserted into.
        obj: ExId,
        path: Vec<Prop>,
        /// The index that the new value was inserted at.
        index: usize,
        /// The value that was inserted, and the id of the operation that inserted it there.
        value: (Value<'static>, ExId),
    },
    /// Incrementing a counter.
    Increment {
        /// The object that was incremented in.
        obj: ExId,
        path: Vec<Prop>,
        /// The key that was incremented.
        key: Prop,
        /// The amount that the counter was incremented by, and the id of the operation that
        /// did the increment.
        value: (i64, ExId),
    },
    /// Deleting an element from a list/text
    Delete {
        /// The object that was deleted from.
        obj: ExId,
        path: Vec<Prop>,
        /// The key that was deleted.
        key: Prop,
    },
}
