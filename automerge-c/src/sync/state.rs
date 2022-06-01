use automerge as am;
use std::cell::RefCell;
use std::collections::BTreeMap;

use crate::change_hashes::AMchangeHashes;
use crate::result::{to_result, AMresult};
use crate::sync::have::AMsyncHave;
use crate::sync::haves::AMsyncHaves;

macro_rules! to_sync_state {
    ($handle:expr) => {{
        let handle = $handle.as_ref();
        match handle {
            Some(b) => b,
            None => return AMresult::err("Invalid AMsyncState pointer").into(),
        }
    }};
}

pub(crate) use to_sync_state;

/// \struct AMsyncState
/// \brief The state of synchronization with a peer.
pub struct AMsyncState {
    body: am::sync::State,
    their_haves_storage: RefCell<BTreeMap<usize, AMsyncHave>>,
}

impl AMsyncState {
    pub fn new(state: am::sync::State) -> Self {
        Self {
            body: state,
            their_haves_storage: RefCell::new(BTreeMap::new()),
        }
    }
}

impl AsMut<am::sync::State> for AMsyncState {
    fn as_mut(&mut self) -> &mut am::sync::State {
        &mut self.body
    }
}

impl AsRef<am::sync::State> for AMsyncState {
    fn as_ref(&self) -> &am::sync::State {
        &self.body
    }
}

impl From<AMsyncState> for *mut AMsyncState {
    fn from(b: AMsyncState) -> Self {
        Box::into_raw(Box::new(b))
    }
}

/// \memberof AMsyncState
/// \brief Decodes an array of bytes into a synchronizaton state.
///
/// \param[in] src A pointer to an array of bytes.
/// \param[in] count The number of bytes in \p src to decode.
/// \return A pointer to an `AMresult` struct containing an `AMsyncState`
///         struct.
/// \pre \p src must be a valid address.
/// \pre `0 <=` \p count `<=` length of \p src.
/// \warning To avoid a memory leak, the returned `AMresult` struct must be
///          deallocated with `AMresultFree()`.
/// \internal
///
/// # Safety
/// src must be a byte array of length `>= count`
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateDecode(src: *const u8, count: usize) -> *mut AMresult {
    let mut data = Vec::new();
    data.extend_from_slice(std::slice::from_raw_parts(src, count));
    to_result(am::sync::State::decode(&data))
}

/// \memberof AMsyncState
/// \brief Encodes a synchronizaton state as an array of bytes.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \return A pointer to an `AMresult` struct containing an array of bytes as
///         an `AMbyteSpan` struct.
/// \pre \p sync_state must be a valid address.
/// \warning To avoid a memory leak, the returned `AMresult` struct must be
///          deallocated with `AMresultFree()`.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateEncode(sync_state: *const AMsyncState) -> *mut AMresult {
    let sync_state = to_sync_state!(sync_state);
    to_result(sync_state.as_ref().encode())
}

/// \memberof AMsyncState
/// \brief Compares two synchronization states for equality.
///
/// \param[in] sync_state1 A pointer to an `AMsyncState` struct.
/// \param[in] sync_state2 A pointer to an `AMsyncState` struct.
/// \return `true` if \p sync_state1 `==` \p sync_state2 and `false` otherwise.
/// \pre \p sync_state1 must be a valid address.
/// \pre \p sync_state2 must be a valid address.
/// \internal
///
/// #Safety
/// sync_state1 must be a pointer to a valid AMsyncState
/// sync_state2 must be a pointer to a valid AMsyncState
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateEqual(
    sync_state1: *const AMsyncState,
    sync_state2: *const AMsyncState,
) -> bool {
    match (sync_state1.as_ref(), sync_state2.as_ref()) {
        (Some(sync_state1), Some(sync_state2)) => sync_state1.as_ref() == sync_state2.as_ref(),
        (None, Some(_)) | (Some(_), None) | (None, None) => false,
    }
}

/// \memberof AMsyncState
/// \brief Deallocates the storage for an `AMsyncState` struct previously
///        allocated by `AMsyncStateInit()`.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \pre \p sync_state must be a valid address.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateFree(sync_state: *mut AMsyncState) {
    if !sync_state.is_null() {
        let sync_state: AMsyncState = *Box::from_raw(sync_state);
        drop(sync_state)
    }
}

/// \memberof AMsyncState
/// \brief Allocates a new `AMsyncState` struct and initializes it with
///        defaults.
///
/// \return A pointer to an `AMsyncState` struct.
/// \warning To avoid a memory leak, the returned `AMsyncState` struct must be
///          deallocated with `AMsyncStateFree()`.
#[no_mangle]
pub extern "C" fn AMsyncStateInit() -> *mut AMsyncState {
    AMsyncState::new(am::sync::State::new()).into()
}

/// \memberof AMsyncState
/// \brief Gets the heads that are shared by both peers.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \return An `AMchangeHashes` struct.
/// \pre \p sync_state must be a valid address.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateSharedHeads(sync_state: *const AMsyncState) -> AMchangeHashes {
    if let Some(sync_state) = sync_state.as_ref() {
        AMchangeHashes::new(&sync_state.as_ref().shared_heads)
    } else {
        AMchangeHashes::default()
    }
}

/// \memberof AMsyncState
/// \brief Gets the heads that were last sent by this peer.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \return An `AMchangeHashes` struct.
/// \pre \p sync_state must be a valid address.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateLastSentHeads(
    sync_state: *const AMsyncState,
) -> AMchangeHashes {
    if let Some(sync_state) = sync_state.as_ref() {
        AMchangeHashes::new(&sync_state.as_ref().last_sent_heads)
    } else {
        AMchangeHashes::default()
    }
}

/// \memberof AMsyncState
/// \brief Gets a summary of the changes that the other peer already has.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \param[out] has_value A pointer to a boolean flag that is set to `true` if
///             the returned `AMhaves` struct is relevant, `false` otherwise.
/// \return An `AMhaves` struct.
/// \pre \p sync_state must be a valid address.
/// \pre \p has_value must be a valid address.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
/// has_value must be a pointer to a valid bool.
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateTheirHaves(
    sync_state: *const AMsyncState,
    has_value: *mut bool,
) -> AMsyncHaves {
    if let Some(sync_state) = sync_state.as_ref() {
        if let Some(haves) = &sync_state.as_ref().their_have {
            *has_value = true;
            return AMsyncHaves::new(haves, &mut sync_state.their_haves_storage.borrow_mut());
        };
    };
    *has_value = false;
    AMsyncHaves::default()
}

/// \memberof AMsyncState
/// \brief Gets the heads that were sent by the other peer.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \param[out] has_value A pointer to a boolean flag that is set to `true` if
///             the returned `AMchangeHashes` struct is relevant, `false`
///             otherwise.
/// \return An `AMchangeHashes` struct.
/// \pre \p sync_state must be a valid address.
/// \pre \p has_value must be a valid address.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
/// has_value must be a pointer to a valid bool.
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateTheirHeads(
    sync_state: *const AMsyncState,
    has_value: *mut bool,
) -> AMchangeHashes {
    if let Some(sync_state) = sync_state.as_ref() {
        if let Some(change_hashes) = &sync_state.as_ref().their_heads {
            *has_value = true;
            return AMchangeHashes::new(change_hashes);
        }
    };
    *has_value = false;
    AMchangeHashes::default()
}

/// \memberof AMsyncState
/// \brief Gets the needs that were sent by the other peer.
///
/// \param[in] sync_state A pointer to an `AMsyncState` struct.
/// \param[out] has_value A pointer to a boolean flag that is set to `true` if
///             the returned `AMchangeHashes` struct is relevant, `false`
///             otherwise.
/// \return An `AMchangeHashes` struct.
/// \pre \p sync_state must be a valid address.
/// \pre \p has_value must be a valid address.
/// \internal
///
/// # Safety
/// sync_state must be a pointer to a valid AMsyncState
/// has_value must be a pointer to a valid bool.
#[no_mangle]
pub unsafe extern "C" fn AMsyncStateTheirNeeds(
    sync_state: *const AMsyncState,
    has_value: *mut bool,
) -> AMchangeHashes {
    if let Some(sync_state) = sync_state.as_ref() {
        if let Some(change_hashes) = &sync_state.as_ref().their_need {
            *has_value = true;
            return AMchangeHashes::new(change_hashes);
        }
    };
    *has_value = false;
    AMchangeHashes::default()
}
