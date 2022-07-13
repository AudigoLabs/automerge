(function() {var implementors = {};
implementors["automerge"] = [{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.AutoCommit.html\" title=\"struct automerge::AutoCommit\">AutoCommit</a>","synthetic":false,"types":["automerge::autocommit::AutoCommit"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.Automerge.html\" title=\"struct automerge::Automerge\">Automerge</a>","synthetic":false,"types":["automerge::automerge::Automerge"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.Change.html\" title=\"struct automerge::Change\">Change</a>","synthetic":false,"types":["automerge::change::Change"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.DecodingError.html\" title=\"enum automerge::DecodingError\">Error</a>","synthetic":false,"types":["automerge::decoding::Error"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.InvalidChangeError.html\" title=\"enum automerge::InvalidChangeError\">InvalidChangeError</a>","synthetic":false,"types":["automerge::decoding::InvalidChangeError"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.EncodingError.html\" title=\"enum automerge::EncodingError\">Error</a>","synthetic":false,"types":["automerge::encoding::Error"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.AutomergeError.html\" title=\"enum automerge::AutomergeError\">AutomergeError</a>","synthetic":false,"types":["automerge::error::AutomergeError"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.InvalidActorId.html\" title=\"struct automerge::InvalidActorId\">InvalidActorId</a>","synthetic":false,"types":["automerge::error::InvalidActorId"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.InvalidChangeHashSlice.html\" title=\"struct automerge::InvalidChangeHashSlice\">InvalidChangeHashSlice</a>","synthetic":false,"types":["automerge::error::InvalidChangeHashSlice"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.ObjId.html\" title=\"enum automerge::ObjId\">ExId</a>","synthetic":false,"types":["automerge::exid::ExId"]},{"text":"impl&lt;'a, 'k&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.Keys.html\" title=\"struct automerge::Keys\">Keys</a>&lt;'a, 'k&gt;","synthetic":false,"types":["automerge::keys::Keys"]},{"text":"impl&lt;'a, 'k&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.KeysAt.html\" title=\"struct automerge::KeysAt\">KeysAt</a>&lt;'a, 'k&gt;","synthetic":false,"types":["automerge::keys_at::KeysAt"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.ExpandedChange.html\" title=\"struct automerge::ExpandedChange\">Change</a>","synthetic":false,"types":["automerge::legacy::Change"]},{"text":"impl&lt;'a, R:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> + <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/ops/range/trait.RangeBounds.html\" title=\"trait core::ops::range::RangeBounds\">RangeBounds</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/1.62.0/std/primitive.usize.html\">usize</a>&gt;&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.ListRange.html\" title=\"struct automerge::ListRange\">ListRange</a>&lt;'a, R&gt;","synthetic":false,"types":["automerge::list_range::ListRange"]},{"text":"impl&lt;'a, R:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> + <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/ops/range/trait.RangeBounds.html\" title=\"trait core::ops::range::RangeBounds\">RangeBounds</a>&lt;<a class=\"primitive\" href=\"https://doc.rust-lang.org/1.62.0/std/primitive.usize.html\">usize</a>&gt;&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.ListRangeAt.html\" title=\"struct automerge::ListRangeAt\">ListRangeAt</a>&lt;'a, R&gt;","synthetic":false,"types":["automerge::list_range_at::ListRangeAt"]},{"text":"impl&lt;'a, R:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> + <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/ops/range/trait.RangeBounds.html\" title=\"trait core::ops::range::RangeBounds\">RangeBounds</a>&lt;<a class=\"struct\" href=\"https://doc.rust-lang.org/1.62.0/alloc/string/struct.String.html\" title=\"struct alloc::string::String\">String</a>&gt;&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.MapRange.html\" title=\"struct automerge::MapRange\">MapRange</a>&lt;'a, R&gt;","synthetic":false,"types":["automerge::map_range::MapRange"]},{"text":"impl&lt;'a, R:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> + <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/ops/range/trait.RangeBounds.html\" title=\"trait core::ops::range::RangeBounds\">RangeBounds</a>&lt;<a class=\"struct\" href=\"https://doc.rust-lang.org/1.62.0/alloc/string/struct.String.html\" title=\"struct alloc::string::String\">String</a>&gt;&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.MapRangeAt.html\" title=\"struct automerge::MapRangeAt\">MapRangeAt</a>&lt;'a, R&gt;","synthetic":false,"types":["automerge::map_range_at::MapRangeAt"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.VecOpObserver.html\" title=\"struct automerge::VecOpObserver\">VecOpObserver</a>","synthetic":false,"types":["automerge::op_observer::VecOpObserver"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.Patch.html\" title=\"enum automerge::Patch\">Patch</a>","synthetic":false,"types":["automerge::op_observer::Patch"]},{"text":"impl&lt;'a, Obs:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a>&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.ApplyOptions.html\" title=\"struct automerge::ApplyOptions\">ApplyOptions</a>&lt;'a, Obs&gt;","synthetic":false,"types":["automerge::options::ApplyOptions"]},{"text":"impl&lt;'a&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.Parents.html\" title=\"struct automerge::Parents\">Parents</a>&lt;'a&gt;","synthetic":false,"types":["automerge::parents::Parents"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/sync/struct.BloomFilter.html\" title=\"struct automerge::sync::BloomFilter\">BloomFilter</a>","synthetic":false,"types":["automerge::sync::bloom::BloomFilter"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/sync/struct.State.html\" title=\"struct automerge::sync::State\">State</a>","synthetic":false,"types":["automerge::sync::state::State"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/sync/struct.Have.html\" title=\"struct automerge::sync::Have\">Have</a>","synthetic":false,"types":["automerge::sync::state::Have"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/sync/struct.Message.html\" title=\"struct automerge::sync::Message\">Message</a>","synthetic":false,"types":["automerge::sync::Message"]},{"text":"impl&lt;'a, Obs:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a>&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/transaction/struct.CommitOptions.html\" title=\"struct automerge::transaction::CommitOptions\">CommitOptions</a>&lt;'a, Obs&gt;","synthetic":false,"types":["automerge::transaction::commit::CommitOptions"]},{"text":"impl&lt;'a&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/transaction/struct.Transaction.html\" title=\"struct automerge::transaction::Transaction\">Transaction</a>&lt;'a&gt;","synthetic":false,"types":["automerge::transaction::manual_transaction::Transaction"]},{"text":"impl&lt;O:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a>&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/transaction/struct.Success.html\" title=\"struct automerge::transaction::Success\">Success</a>&lt;O&gt;","synthetic":false,"types":["automerge::transaction::result::Success"]},{"text":"impl&lt;E:&nbsp;<a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a>&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/transaction/struct.Failure.html\" title=\"struct automerge::transaction::Failure\">Failure</a>&lt;E&gt;","synthetic":false,"types":["automerge::transaction::result::Failure"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.ActorId.html\" title=\"struct automerge::ActorId\">ActorId</a>","synthetic":false,"types":["automerge::types::ActorId"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.ObjType.html\" title=\"enum automerge::ObjType\">ObjType</a>","synthetic":false,"types":["automerge::types::ObjType"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.OpType.html\" title=\"enum automerge::OpType\">OpType</a>","synthetic":false,"types":["automerge::types::OpType"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.Prop.html\" title=\"enum automerge::Prop\">Prop</a>","synthetic":false,"types":["automerge::types::Prop"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.ChangeHash.html\" title=\"struct automerge::ChangeHash\">ChangeHash</a>","synthetic":false,"types":["automerge::types::ChangeHash"]},{"text":"impl&lt;'a&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.Value.html\" title=\"enum automerge::Value\">Value</a>&lt;'a&gt;","synthetic":false,"types":["automerge::value::Value"]},{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"enum\" href=\"automerge/enum.ScalarValue.html\" title=\"enum automerge::ScalarValue\">ScalarValue</a>","synthetic":false,"types":["automerge::value::ScalarValue"]},{"text":"impl&lt;'a&gt; <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge/struct.Values.html\" title=\"struct automerge::Values\">Values</a>&lt;'a&gt;","synthetic":false,"types":["automerge::values::Values"]}];
implementors["automerge_wasm"] = [{"text":"impl <a class=\"trait\" href=\"https://doc.rust-lang.org/1.62.0/core/fmt/trait.Debug.html\" title=\"trait core::fmt::Debug\">Debug</a> for <a class=\"struct\" href=\"automerge_wasm/struct.Automerge.html\" title=\"struct automerge_wasm::Automerge\">Automerge</a>","synthetic":false,"types":["automerge_wasm::Automerge"]}];
if (window.register_implementors) {window.register_implementors(implementors);} else {window.pending_implementors = implementors;}})()