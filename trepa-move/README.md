Trepa Move package (skeleton)

This package provides a Treasury Move module that demonstrates how to use 0xSecure to guard sensitive
on-chain actions with ApprovalReceipts.

Files:
- Move.toml - declares dependency on 0xSecure (testnet package ID pinned)
- sources/treasury.move - Treasury object and guarded_withdraw that calls enforcement::assert_action

Build and test (local Sui devnet or framework):

1. Ensure Sui CLI is installed and pointing to desired env.
2. From this directory run:
   sui move build
   sui move test

Notes:
- The code is a skeleton example intended to align with the PTB/oxsecure semantics used in the JS helper.
- Before publishing on testnet/mainnet, update the 0xSecure dependency to a proper release tag or commit.
