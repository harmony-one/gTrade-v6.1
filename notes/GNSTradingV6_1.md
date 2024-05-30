# GNSTradingV6_1 Contract Overview and Function Documentation

## Overview
The `GNSTradingV6_1` contract is designed to manage trading operations, including opening and closing trades, setting parameters, and handling limit orders. It interacts with `StorageInterfaceV5` and `GNSPairInfosInterfaceV6` contracts to fetch and store necessary data. Key functionalities include managing positions, updating trading parameters, and handling state changes like pausing or completing operations.

## Contract Structure

### State Variables
- **Contracts (constant):**
  - `StorageInterfaceV5 immutable storageT`
  - `GNSPairInfosInterfaceV6 immutable pairInfos`
- **Params (constant):**
  - `uint constant PRECISION = 1e10`
  - `uint constant MAX_SL_P = 75`
- **Params (adjustable):**
  - `uint public maxPosDai = 75000 * 1e18`
  - `uint public limitOrdersTimelock = 30`
  - `uint public marketOrdersTimeout = 30`
- **State:**
  - `bool public isPaused`
  - `bool public isDone`

### Events
- `Done(bool done)`
- `Paused(bool paused)`
- `NumberUpdated(string name, uint value)`
- `AddressUpdated(string name, address a)`
- `MarketOrderInitiated(address trader, uint pairIndex, bool open, uint orderId)`
- `NftOrderInitiated(address nftHolder, address trader, uint pairIndex, uint orderId)`
- `NftOrderSameBlock(address nftHolder, address trader, uint pairIndex)`
- `OpenLimitPlaced(address trader, uint pairIndex, uint index)`
- `OpenLimitUpdated(address trader, uint pairIndex, uint index, uint newPrice, uint newTp, uint newSl)`
- `OpenLimitCanceled(address trader, uint pairIndex, uint index)`
- `TpUpdated(address trader, uint pairIndex, uint index, uint newTp)`
- `SlUpdated(address trader, uint pairIndex, uint index, uint newSl)`
- `SlUpdateInitiated(address trader, uint pairIndex, uint index, uint newSl, uint orderId)`
- `ChainlinkCallbackTimeout(uint orderId, StorageInterfaceV5.PendingMarketOrder order)`
- `CouldNotCloseTrade(address trader, uint pairIndex, uint index)`

### Modifiers
- `onlyGov`: Ensures the caller is the governance address.
- `notContract`: Ensures the caller is not a contract.
- `notDone`: Ensures the contract is not marked as done.

## Function Documentation

### Constructor
```solidity
constructor(StorageInterfaceV5 _storageT, GNSPairInfosInterfaceV6 _pairInfos)
```
Initializes the contract with the storage and pair information contracts.

### Manage Parameters
#### `setMaxPosDai`
```solidity
function setMaxPosDai(uint _max) external onlyGov
```
Sets the maximum position size in DAI.
- Requires `_max` to be greater than 0.
- Emits `NumberUpdated("maxPosDai", _max)`.

#### `setLimitOrdersTimelock`
```solidity
function setLimitOrdersTimelock(uint _blocks) external onlyGov
```
Sets the timelock for limit orders.
- Requires `_blocks` to be greater than 0.
- Emits `NumberUpdated("limitOrdersTimelock", _blocks)`.

#### `setMarketOrdersTimeout`
```solidity
function setMarketOrdersTimeout(uint _marketOrdersTimeout) external onlyGov
```
Sets the timeout for market orders.
- Requires `_marketOrdersTimeout` to be greater than 0.
- Emits `NumberUpdated("marketOrdersTimeout", _marketOrdersTimeout)`.

### Manage State
#### `pause`
```solidity
function pause() external onlyGov
```
Toggles the paused state of the contract.
- Emits `Paused(isPaused)`.

#### `done`
```solidity
function done() external onlyGov
```
Toggles the done state of the contract.
- Emits `Done(isDone)`.

### Open Trade
#### `openTrade`
```solidity
function openTrade(
    StorageInterfaceV5.Trade memory t,
    NftRewardsInterfaceV6.OpenLimitOrderType _type,
    uint _spreadReductionId,
    uint _slippageP,
    address _referral
) external notContract notDone
```
Opens a new trade.
- Validates various conditions including `isPaused`, trade limits, leverage, etc.
- Transfers DAI from trader to storage.
- If `_type` is not `LEGACY`, places an open limit order.
- If `_type` is `LEGACY`, initiates a market order.
- Emits `OpenLimitPlaced` or `MarketOrderInitiated`.
- Stores the referral information.

### Close Trade
#### `closeTradeMarket`
```solidity
function closeTradeMarket(uint _pairIndex, uint _index) external notContract notDone
```
Closes an open trade.
- Validates trade existence and leverage.
- Initiates a market order to close the trade.
- Emits `MarketOrderInitiated`.

### Manage Limit Orders
#### `updateOpenLimitOrder`
```solidity
function updateOpenLimitOrder(
    uint _pairIndex,
    uint _index,
    uint _price,
    uint _tp,
    uint _sl
) external notContract notDone
```
Updates an existing open limit order.
- Validates order existence and timelock.
- Updates order parameters.
- Emits `OpenLimitUpdated`.

#### `cancelOpenLimitOrder`
```solidity
function cancelOpenLimitOrder(uint _pairIndex, uint _index) external notContract notDone
```
Cancels an existing open limit order.
- Validates order existence and timelock.
- Transfers DAI back to the trader.
- Unregisters the order.
- Emits `OpenLimitCanceled`.

### Update TP/SL
#### `updateTp`
```solidity
function updateTp(uint _pairIndex, uint _index, uint _newTp) external notContract notDone
```
Updates the take profit (TP) value of a trade.
- Validates trade existence and timelock.
- Updates TP.
- Emits `TpUpdated`.

#### `updateSl`
```solidity
function updateSl(uint _pairIndex, uint _index, uint _newSl) external notContract notDone
```
Updates the stop loss (SL) value of a trade.
- Validates trade existence, SL distance, and timelock.
- If guaranteed SL is enabled, handles additional logic.
- Updates SL.
- Emits `SlUpdated` or `SlUpdateInitiated`.

### Execute Limit Order
#### `executeNftOrder`
```solidity
function executeNftOrder(
    StorageInterfaceV5.LimitOrder _orderType,
    address _trader,
    uint _pairIndex,
    uint _index,
    uint _nftId,
    uint _nftType
) external notContract notDone
```
Executes an NFT order.
- Validates NFT ownership and timelock.
- Depending on the order type, validates trade or limit order existence.
- Transfers LINK to the aggregator.
- Initiates the price fetching and order storing process.
- Emits `NftOrderInitiated` or `NftOrderSameBlock`.

### Market Timeout
#### `openTradeMarketTimeout`
```solidity
function openTradeMarketTimeout(uint _order) external notContract notDone
```
Handles timeout for opening a market trade.
- Validates the timeout condition.
- Transfers DAI back to the trader.
- Unregisters the pending market order.
- Emits `ChainlinkCallbackTimeout`.

#### `closeTradeMarketTimeout`
```solidity
function closeTradeMarketTimeout(uint _order) external notContract notDone
```
Handles timeout for closing a market trade.
- Validates the timeout condition.
- Unregisters the pending market order.
- Attempts to close the trade.
- Emits `CouldNotCloseTrade` and `ChainlinkCallbackTimeout`.