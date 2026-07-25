#![no_std]
#![no_main]

extern crate alloc;

use alloc::collections::BTreeMap;
use alloc::format;
use alloc::string::String;
use alloc::string::ToString;
use alloc::vec;

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    contracts::{EntryPoint, EntryPointAccess, EntryPointType, EntryPoints, Parameter},
    CLType, Key,
};

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

/// Entry point to register a payable service into contract storage.
#[no_mangle]
pub extern "C" fn register_service() {
    let service_id: String = runtime::get_named_arg("service_id");
    let price_motes: String = runtime::get_named_arg("price_motes");
    let endpoint_hash: String = runtime::get_named_arg("endpoint_hash");

    let services_uref = runtime::get_key("services")
        .unwrap_or_revert_with(casper_types::ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert();

    let service_val = format!(
        "{{\"service_id\":\"{}\",\"price_motes\":\"{}\",\"endpoint_hash\":\"{}\"}}",
        service_id, price_motes, endpoint_hash
    );

    storage::dictionary_put(services_uref, &service_id, service_val);
}

/// Entry point to log an immutable payment receipt on-chain.
#[no_mangle]
pub extern "C" fn log_payment() {
    let service_id: String = runtime::get_named_arg("service_id");
    let payer: String = runtime::get_named_arg("payer");
    let amount: String = runtime::get_named_arg("amount");
    let receipt_hash: String = runtime::get_named_arg("receipt_hash");
    let timestamp: u64 = runtime::get_named_arg("timestamp");

    let records_uref = runtime::get_key("records")
        .unwrap_or_revert_with(casper_types::ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert();

    // Global counter
    let count_uref = runtime::get_key("total_payments")
        .unwrap_or_revert_with(casper_types::ApiError::MissingKey)
        .into_uref()
        .unwrap_or_revert();

    let current_count: u64 = storage::read(count_uref)
        .unwrap_or_revert()
        .unwrap_or(0u64);

    let next_count = current_count + 1;
    storage::write(count_uref, next_count);

    // Save under global record key: "payment_{next_count}"
    let record_key = format!("payment_{}", next_count);
    let record_val = format!(
        "{{\"index\":{},\"service_id\":\"{}\",\"payer\":\"{}\",\"amount\":\"{}\",\"receipt_hash\":\"{}\",\"timestamp\":{}}}",
        next_count, service_id, payer, amount, receipt_hash, timestamp
    );
    storage::dictionary_put(records_uref, &record_key, record_val.clone());

    // Also track per-payer count & record: "{payer}_count" & "{payer}_{payer_count}"
    let payer_count_key = format!("{}_count", payer);
    let payer_count: u64 = storage::dictionary_get::<u64>(records_uref, &payer_count_key)
        .unwrap_or_revert()
        .unwrap_or(0u64);
    let next_payer_count = payer_count + 1;
    storage::dictionary_put(records_uref, &payer_count_key, next_payer_count);

    let payer_record_key = format!("{}_{}", payer, next_payer_count);
    storage::dictionary_put(records_uref, &payer_record_key, record_val);
}

#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    entry_points.add_entry_point(EntryPoint::new(
        "register_service",
        vec![
            Parameter::new("service_id", CLType::String),
            Parameter::new("price_motes", CLType::String),
            Parameter::new("endpoint_hash", CLType::String),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "log_payment",
        vec![
            Parameter::new("service_id", CLType::String),
            Parameter::new("payer", CLType::String),
            Parameter::new("amount", CLType::String),
            Parameter::new("receipt_hash", CLType::String),
            Parameter::new("timestamp", CLType::U64),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    let mut named_keys = BTreeMap::new();
    let records_uref = storage::new_dictionary("records").unwrap_or_revert();
    let services_uref = storage::new_dictionary("services").unwrap_or_revert();
    let total_payments_uref = storage::new_uref(0u64);

    named_keys.insert("records".to_string(), Key::from(records_uref));
    named_keys.insert("services".to_string(), Key::from(services_uref));
    named_keys.insert("total_payments".to_string(), Key::from(total_payments_uref));

    let (contract_hash, _contract_version) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some("cspr_sentinel_package_name".to_string()),
        Some("cspr_sentinel_access_uref_name".to_string()),
    );

    runtime::put_key("cspr_sentinel", Key::from(contract_hash));

    let hash_string = format!("hash-{}", contract_hash.to_formatted_string());
    runtime::put_key(
        "cspr_sentinel_hash_string",
        Key::from(storage::new_uref(hash_string)),
    );
}
