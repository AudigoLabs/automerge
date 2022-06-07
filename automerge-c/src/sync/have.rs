use automerge as am;

use crate::change_hashes::AMchangeHashes;

/// \struct AMsyncHave
/// \brief A summary of the changes that the sender of a synchronization
///        message already has.
#[derive(Clone)]
pub struct AMsyncHave(*const am::sync::Have);

impl AMsyncHave {
    pub fn new(have: &am::sync::Have) -> Self {
        Self(have)
    }
}

impl AsRef<am::sync::Have> for AMsyncHave {
    fn as_ref(&self) -> &am::sync::Have {
        unsafe { &*self.0 }
    }
}

/// \memberof AMsyncHave
/// \brief Gets the heads of the sender.
///
/// \param[in] sync_have A pointer to an `AMsyncHave` struct.
/// \return An `AMchangeHashes` struct.
/// \pre \p sync_have must be a valid address.
/// \internal
///
/// # Safety
/// sync_have must be a pointer to a valid AMsyncHave
#[no_mangle]
pub unsafe extern "C" fn AMsyncHaveLastSync(sync_have: *const AMsyncHave) -> AMchangeHashes {
    if let Some(sync_have) = sync_have.as_ref() {
        AMchangeHashes::new(&sync_have.as_ref().last_sync)
    } else {
        AMchangeHashes::default()
    }
}
