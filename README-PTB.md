Trepa PTB helper (prototype)

Files:
- src/ptb/bcs_helper.ts  -- minimal BCS-like serialisation helpers (ULEB128 length prefix, u64 LE)
- src/ptb/action_hash.ts  -- digestUnbound(...) -> blake2b-256 of serialized fields

Notes:
- This is a prototype. For production compatibility with Sui/Move BCS, use @mysten/bcs and verify digest vectors against the oxsecure Move implementation.
- Run: npm install && npm run build
- Tests and x402 integration wrappers can be added next.
