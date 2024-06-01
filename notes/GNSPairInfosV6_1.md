# GNSPairInfosV6_1 Contract Overview and Function Documentation

## Overview
The `GNSPairInfosV6_1` contract manages parameters and fee structures for trading pairs, including funding fees, rollover fees, and price impacts. It interacts with `StorageInterfaceV5` to fetch and store necessary data.

## Contract Structure

### State Variables
- **Contracts:**
  - `StorageInterfaceV5 immutable storageT`
  - `address public manager`
- **Constant Parameters:**
  - `uint constant PRECISION = 1e10`
  - `uint constant LIQ_THRESHOLD_P = 90` // -90% (of collateral)
- **Adjustable Parameters:**
  - `uint public maxNegativePnlOnOpenP = 40 * PRECISION` // PRECISION (%)
- **Structs:**
  - `PairParams`: Stores parameters for each pair.
  - `PairFundingFees`: Stores accumulated funding fees for each pair.
  - `PairRolloverFees`: Stores accumulated rollover fees for each pair.
  - `TradeInitialAccFees`: Stores initial accumulated fees when a trade is opened.
- **Mappings:**
  - `mapping(uint => PairParams) public pairParams`
  - `mapping(uint => PairFundingFees) public pairFundingFees`
  - `mapping(uint => PairRolloverFees) public pairRolloverFees`
  - `mapping(address => mapping(uint => mapping(uint => TradeInitialAccFees))) public tradeInitialAccFees`

### Events
- `ManagerUpdated(address value)`
- `MaxNegativePnlOnOpenPUpdated(uint value)`
- `PairParamsUpdated(uint pairIndex, PairParams value)`
- `OnePercentDepthUpdated(uint pairIndex, uint valueAbove, uint valueBelow)`
- `RolloverFeePerBlockPUpdated(uint pairIndex, uint value)`
- `FundingFeePerBlockPUpdated(uint pairIndex, uint value)`
- `TradeInitialAccFeesStored(address trader, uint pairIndex, uint index, uint rollover, int funding)`
- `AccFundingFeesStored(uint pairIndex, int valueLong, int valueShort)`
- `AccRolloverFeesStored(uint pairIndex, uint value)`
- `FeesCharged(uint pairIndex, bool long, uint collateral, uint leverage, int percentProfit, uint rolloverFees, int fundingFees)`

### Modifiers
- `onlyGov`: Ensures the caller is the governance address.
- `onlyManager`: Ensures the caller is the manager.
- `onlyCallbacks`: Ensures the caller is the callback contract.

## Function Documentation

### Constructor
```solidity
constructor(StorageInterfaceV5 _storageT)
```
Initializes the contract with the storage contract.

### Manage Parameters
#### `setManager`
```solidity
function setManager(address _manager) external onlyGov
```
Sets the manager address.
- Emits `ManagerUpdated(_manager)`.

#### `setMaxNegativePnlOnOpenP`
```solidity
function setMaxNegativePnlOnOpenP(uint value) external onlyManager
```
Sets the maximum negative PnL percentage on trade opening.
- Emits `MaxNegativePnlOnOpenPUpdated(value)`.

#### `setPairParams`
```solidity
function setPairParams(uint pairIndex, PairParams memory value) public onlyManager
```
Sets the parameters for a specific trading pair.
- Stores accumulated rollover and funding fees before updating.
- Emits `PairParamsUpdated(pairIndex, value)`.

#### `setPairParamsArray`
```solidity
function setPairParamsArray(uint[] memory indices, PairParams[] memory values) external onlyManager
```
Sets the parameters for multiple trading pairs.
- Requires that the length of `indices` and `values` match.
- Calls `setPairParams` for each pair.

#### `setOnePercentDepth`
```solidity
function setOnePercentDepth(uint pairIndex, uint valueAbove, uint valueBelow) public onlyManager
```
Sets the one percent depth for a specific trading pair.
- Emits `OnePercentDepthUpdated(pairIndex, valueAbove, valueBelow)`.

#### `setOnePercentDepthArray`
```solidity
function setOnePercentDepthArray(uint[] memory indices, uint[] memory valuesAbove, uint[] memory valuesBelow) external onlyManager
```
Sets the one percent depth for multiple trading pairs.
- Requires that the lengths of `indices`, `valuesAbove`, and `valuesBelow` match.
- Calls `setOnePercentDepth` for each pair.

#### `setRolloverFeePerBlockP`
```solidity
function setRolloverFeePerBlockP(uint pairIndex, uint value) public onlyManager
```
Sets the rollover fee per block for a specific trading pair.
- Requires `value` to be less than or equal to 25,000,000 (≈ 100% per day).
- Stores accumulated rollover fees before updating.
- Emits `RolloverFeePerBlockPUpdated(pairIndex, value)`.

#### `setRolloverFeePerBlockPArray`
```solidity
function setRolloverFeePerBlockPArray(uint[] memory indices, uint[] memory values) external onlyManager
```
Sets the rollover fee per block for multiple trading pairs.
- Requires that the length of `indices` and `values` match.
- Calls `setRolloverFeePerBlockP` for each pair.

#### `setFundingFeePerBlockP`
```solidity
function setFundingFeePerBlockP(uint pairIndex, uint value) public onlyManager
```
Sets the funding fee per block for a specific trading pair.
- Requires `value` to be less than or equal to 10,000,000 (≈ 40% per day).
- Stores accumulated funding fees before updating.
- Emits `FundingFeePerBlockPUpdated(pairIndex, value)`.

#### `setFundingFeePerBlockPArray`
```solidity
function setFundingFeePerBlockPArray(uint[] memory indices, uint[] memory values) external onlyManager
```
Sets the funding fee per block for multiple trading pairs.
- Requires that the length of `indices` and `values` match.
- Calls `setFundingFeePerBlockP` for each pair.

### Store Fees
#### `storeTradeInitialAccFees`
```solidity
function storeTradeInitialAccFees(address trader, uint pairIndex, uint index, bool long) external onlyCallbacks
```
Stores the initial accumulated fees when a trade is opened.
- Stores accumulated funding fees before updating.
- Emits `TradeInitialAccFeesStored`.

#### `storeAccRolloverFees`
```solidity
function storeAccRolloverFees(uint pairIndex) private
```
Stores the accumulated rollover fees for a specific trading pair.
- Updates the accumulated fees and last update block.
- Emits `AccRolloverFeesStored`.

#### `getPendingAccRolloverFees`
```solidity
function getPendingAccRolloverFees(uint pairIndex) public view returns(uint)
```
Calculates the pending accumulated rollover fees for a specific trading pair.

#### `storeAccFundingFees`
```solidity
function storeAccFundingFees(uint pairIndex) private
```
Stores the accumulated funding fees for a specific trading pair.
- Updates the accumulated fees and last update block.
- Emits `AccFundingFeesStored`.

#### `getPendingAccFundingFees`
```solidity
function getPendingAccFundingFees(uint pairIndex) public view returns(int valueLong, int valueShort)
```
Calculates the pending accumulated funding fees for a specific trading pair.

### Price Impact
#### `getTradePriceImpact`
```solidity
function getTradePriceImpact(uint openPrice, uint pairIndex, bool long, uint tradeOpenInterest) external view returns(uint priceImpactP, uint priceAfterImpact)
```
Calculates the price impact of a trade opening.
- Calls `getTradePriceImpactPure` with relevant parameters.

#### `getTradePriceImpactPure`
```solidity
function getTradePriceImpactPure(uint openPrice, bool long, uint startOpenInterest, uint tradeOpenInterest, uint onePercentDepth) public pure returns(uint priceImpactP, uint priceAfterImpact)
```
Pure function to calculate the price impact of a trade opening.

### Fee Values
#### `getTradeRolloverFee`
```solidity
function getTradeRolloverFee(address trader, uint pairIndex, uint index, uint collateral) public view returns(uint)
```
Calculates the rollover fee for a specific trade.
- Calls `getTradeRolloverFeePure` with relevant parameters.

#### `getTradeRolloverFeePure`
```solidity
function getTradeRolloverFeePure(uint accRolloverFeesPerCollateral, uint endAccRolloverFeesPerCollateral, uint collateral) public pure returns(uint)
```
Pure function to calculate the rollover fee.

#### `getTradeFundingFee`
```solidity
function getTradeFundingFee(address trader, uint pairIndex, uint index, bool long, uint collateral, uint leverage) public view returns(int)
```
Calculates the funding fee for a specific trade.
- Calls `getTradeFundingFeePure` with relevant parameters.

#### `getTradeFundingFeePure`
```solidity
function getTradeFundingFeePure(int accFundingFeesPerOi, int endAccFundingFeesPerOi, uint collateral, uint leverage) public pure returns(int)
```
Pure function to calculate the funding fee.

### Liquidation Price
#### `getTradeLiquidationPrice`
```solidity
function getTradeLiquidationPrice(address trader, uint pairIndex, uint index, uint openPrice, bool long, uint collateral, uint leverage) external view returns(uint)
```
Calculates the liquidation price for a specific trade.
- Calls `getTradeLiquidationPricePure` with relevant parameters.

#### `getTradeLiquidationPricePure`
```solidity
function getTradeLiquidationPricePure

(uint openPrice, bool long, uint collateral, uint leverage, uint rolloverFee, int fundingFee) public pure returns(uint)
```
Pure function to calculate the liquidation price.

### Trade Value
#### `getTradeValue`
```solidity
function getTradeValue(address trader, uint pairIndex, uint index, bool long, uint collateral, uint leverage, int percentProfit, uint closingFee) external onlyCallbacks returns(uint amount)
```
Calculates the value of a trade after PnL and fees.
- Stores accumulated funding fees before updating.
- Calls `getTradeValuePure` with relevant parameters.
- Emits `FeesCharged`.

#### `getTradeValuePure`
```solidity
function getTradeValuePure(uint collateral, int percentProfit, uint rolloverFee, int fundingFee, uint closingFee) public pure returns(uint)
```
Pure function to calculate the trade value.

### Getters
#### `getPairInfos`
```solidity
function getPairInfos(uint[] memory indices) external view returns(PairParams[] memory, PairRolloverFees[] memory, PairFundingFees[] memory)
```
Returns the parameters, rollover fees, and funding fees for the specified trading pairs.

#### `getOnePercentDepthAbove`
```solidity
function getOnePercentDepthAbove(uint pairIndex) external view returns(uint)
```
Returns the one percent depth above for a specific trading pair.

#### `getOnePercentDepthBelow`
```solidity
function getOnePercentDepthBelow(uint pairIndex) external view returns(uint)
```
Returns the one percent depth below for a specific trading pair.

#### `getRolloverFeePerBlockP`
```solidity
function getRolloverFeePerBlockP(uint pairIndex) external view returns(uint)
```
Returns the rollover fee per block for a specific trading pair.

#### `getFundingFeePerBlockP`
```solidity
function getFundingFeePerBlockP(uint pairIndex) external view returns(uint)
```
Returns the funding fee per block for a specific trading pair.

#### `getAccRolloverFees`
```solidity
function getAccRolloverFees(uint pairIndex) external view returns(uint)
```
Returns the accumulated rollover fees for a specific trading pair.

#### `getAccRolloverFeesUpdateBlock`
```solidity
function getAccRolloverFeesUpdateBlock(uint pairIndex) external view returns(uint)
```
Returns the last update block for the accumulated rollover fees of a specific trading pair.

#### `getAccFundingFeesLong`
```solidity
function getAccFundingFeesLong(uint pairIndex) external view returns(int)
```
Returns the accumulated funding fees for long positions of a specific trading pair.

#### `getAccFundingFeesShort`
```solidity
function getAccFundingFeesShort(uint pairIndex) external view returns(int)
```
Returns the accumulated funding fees for short positions of a specific trading pair.

#### `getAccFundingFeesUpdateBlock`
```solidity
function getAccFundingFeesUpdateBlock(uint pairIndex) external view returns(uint)
```
Returns the last update block for the accumulated funding fees of a specific trading pair.

#### `getTradeInitialAccRolloverFeesPerCollateral`
```solidity
function getTradeInitialAccRolloverFeesPerCollateral(address trader, uint pairIndex, uint index) external view returns(uint)
```
Returns the initial accumulated rollover fees per collateral for a specific trade.

#### `getTradeInitialAccFundingFeesPerOi`
```solidity
function getTradeInitialAccFundingFeesPerOi(address trader, uint pairIndex, uint index) external view returns(int)
```
Returns the initial accumulated funding fees per open interest for a specific trade.

#### `getTradeOpenedAfterUpdate`
```solidity
function getTradeOpenedAfterUpdate(address trader, uint pairIndex, uint index) external view returns(bool)
```
Returns whether a trade was opened after the last update for a specific trade.