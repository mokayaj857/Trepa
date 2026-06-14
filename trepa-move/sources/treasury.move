module 0x0::treasury {
    use oxsecure::action;
    use oxsecure::approval::ApprovalReceipt;
    use oxsecure::enforcement;
    use oxsecure::policy::Policy;
    use sui::clock::Clock;
    use sui::tx_context::TxContext;

    /// Basic treasury object that holds balances and metadata.
    struct Treasury has key {
        owner: address,
        balance: u64,
    }

    /// Create a treasury owned by the issuer.
    public fun create_treasury(owner: address, initial_balance: u64, ctx: &mut TxContext) {
        let treasury = Treasury {
            owner,
            balance: initial_balance,
        };
        move_to(owner, treasury);
    }

    /// Deposit to a treasury (simple increment).
    public fun deposit(treasury: &mut Treasury, amount: u64) {
        treasury.balance = treasury.balance + amount;
    }

    /// Guarded withdraw: uses oxsecure enforcement to require a valid ApprovalReceipt
    /// matching the action hash, policy, recipient and amount before mutating state.
    public fun guarded_withdraw(
        treasury: &mut Treasury,
        policy: &Policy,
        receipt: ApprovalReceipt,
        action_hash: vector<u8>,
        recipient: address,
        amount: u64,
        clock: &Clock,
    ) {
        enforcement::assert_action(
            policy,
            receipt,
            action_hash,
            action::treasury_withdraw(),
            recipient,
            amount,
            clock,
        );

        // Only update state after the assertion passes.
        // Simple balance check (production should use safe math and richer accounting).
        assert!(treasury.balance >= amount, 1);
        treasury.balance = treasury.balance - amount;
    }
}
