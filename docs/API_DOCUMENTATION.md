# DONE Food Delivery - API Documentation

> **Base URL:** `http://localhost:3000/api`
> **Version:** 1.0.0
> **Tests:** 74/75 passing

---

## Quick Start

```bash
# 1. Start the server
cd backend && npm run dev

# 2. Test the API
curl http://localhost:3000/health

# 3. Run all tests
node src/tests/api-tests.js
```

---

## Authentication

All protected endpoints require Web3 wallet signature in headers:

```http
Authorization: Bearer <signature>
x-wallet-address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
x-message: Sign this message to authenticate
Content-Type: application/json
```

### Roles

| Role | Description |
|------|-------------|
| `CLIENT` | Default user role |
| `RESTAURANT` | Restaurant owner |
| `DELIVERER` | Delivery person (requires staking) |
| `PLATFORM` | Admin/Platform role |

---

## Endpoints Overview

| Category | Count | Auth Required |
|----------|-------|---------------|
| Health | 1 | No |
| Users | 5 | Partial |
| Restaurants | 14 | Partial |
| Deliverers | 12 | Partial |
| Orders | 13 | Partial |
| Admin | 20 | Yes (PLATFORM) |
| Analytics | 5 | Yes (PLATFORM) |
| Oracles | 5 | Partial |
| Disputes | 5 | Partial |
| Tokens | 3 | Partial |
| Payments | 2 | Yes |
| Reviews | 1 | Yes (CLIENT) |
| Upload | 1 | No |
| Cart | 5 | No |

**Total: 96 endpoints**

---

## Health Check

### `GET /health`

Check system status.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "uptime": 12345,
  "timestamp": "2025-01-15T10:00:00Z",
  "checks": {
    "database": "connected",
    "blockchain": "connected",
    "ipfs": "connected"
  }
}
```

---

## Users

### `POST /api/users/register`

Register a new user.

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+33123456789"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### `GET /api/users/:address`

Get user profile.

```bash
curl http://localhost:3000/api/users/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

### `PUT /api/users/:address` (Auth Required)

Update user profile.

```bash
curl -X PUT http://localhost:3000/api/users/0x742d35Cc... \
  -H "Authorization: Bearer <signature>" \
  -H "x-wallet-address: 0x742d35Cc..." \
  -d '{"name": "John Updated", "phone": "+33987654321"}'
```

---

### `GET /api/users/:address/orders`

Get user's orders.

---

### `GET /api/users/:address/tokens`

Get user's DONE token balance.

**Response:**
```json
{
  "success": true,
  "balance": "100.5",
  "transactions": []
}
```

---

## Restaurants

### `POST /api/restaurants/register`

Register a new restaurant.

```json
{
  "address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "name": "Pizza Palace",
  "cuisine": "Italian",
  "description": "Best pizza in town",
  "location": {
    "address": "123 Rue Example, Paris",
    "lat": 48.8566,
    "lng": 2.3522
  }
}
```

---

### `GET /api/restaurants`

List all restaurants.

**Query params:**
- `cuisine` - Filter by cuisine type
- `rating` - Minimum rating

```bash
curl "http://localhost:3000/api/restaurants?cuisine=Italian"
```

---

### `GET /api/restaurants/by-address/:address`

Get restaurant by wallet address.

```bash
curl http://localhost:3000/api/restaurants/by-address/0x8ba1f109551bD432803012645Ac136ddd64DBA72
```

**Response:**
```json
{
  "success": true,
  "restaurant": {
    "_id": "...",
    "address": "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    "name": "Pizza Palace",
    "cuisine": "Italian"
  }
}
```

---

### `GET /api/restaurants/:id`

Get restaurant details.

---

### `PUT /api/restaurants/:id` (Auth: RESTAURANT)

Update restaurant info.

---

### `GET /api/restaurants/:id/orders` (Auth: RESTAURANT)

Get restaurant's orders.

**Query params:**
- `status` - Filter by status (CREATED, PREPARING, etc.)

---

### `GET /api/restaurants/:id/analytics` (Auth: RESTAURANT)

Get restaurant analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 250,
    "revenue": "3750.00",
    "averageRating": 4.8,
    "popularDishes": []
  }
}
```

---

### `PUT /api/restaurants/:id/menu` (Auth: RESTAURANT)

Update entire menu.

---

### `POST /api/restaurants/:id/menu/item` (Auth: RESTAURANT)

Add menu item.

```json
{
  "name": "Pizza Margherita",
  "price": 15.50,
  "description": "Classic Italian pizza",
  "category": "Pizza"
}
```

---

### `PUT /api/restaurants/:id/menu/item/:itemId` (Auth: RESTAURANT)

Update menu item.

---

### `DELETE /api/restaurants/:id/menu/item/:itemId` (Auth: RESTAURANT)

Delete menu item.

---

### `GET /api/restaurants/:id/earnings` (Auth: RESTAURANT)

Get restaurant earnings.

---

### `POST /api/restaurants/:id/withdraw` (Auth: RESTAURANT)

Withdraw funds.

```json
{
  "amount": "100.00"
}
```

---

## Deliverers

### `POST /api/deliverers/register`

Register a new deliverer.

```json
{
  "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "name": "Mike Deliverer",
  "phone": "+33987654321",
  "vehicleType": "bike"
}
```

**Vehicle types:** `bike`, `scooter`, `car`

---

### `GET /api/deliverers/:address`

Get deliverer profile with staking status.

**Response:**
```json
{
  "success": true,
  "deliverer": {
    "address": "0x...",
    "name": "Mike",
    "isStaked": true,
    "stakedAmount": "0.1",
    "rating": 4.6,
    "totalDeliveries": 180
  }
}
```

---

### `GET /api/deliverers/available`

Get available deliverers.

**Query params:**
- `lat` - Latitude (optional, for distance calculation)
- `lng` - Longitude (optional, for distance calculation)

**Response:**
```json
{
  "success": true,
  "deliverers": [
    {
      "address": "0x...",
      "name": "Mike",
      "isAvailable": true,
      "isStaked": true,
      "rating": 4.6
    }
  ]
}
```

---

### `POST /api/deliverers/orders/:orderId/accept` (Auth: DELIVERER)

Accept an order for delivery.

```json
{
  "delivererAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 123,
    "deliverer": "0x...",
    "status": "IN_DELIVERY"
  }
}
```

---

### `PUT /api/deliverers/:address/status` (Auth: DELIVERER)

Update availability.

```json
{
  "isAvailable": true
}
```

---

### `POST /api/deliverers/stake` (Auth: DELIVERER)

Stake as deliverer (min 0.1 ETH).

```json
{
  "address": "0x...",
  "amount": "0.1"
}
```

---

### `POST /api/deliverers/unstake` (Auth: DELIVERER)

Withdraw stake.

---

### `GET /api/deliverers/:address/orders`

Get deliverer's orders.

---

### `GET /api/deliverers/:address/earnings` (Auth: DELIVERER)

Get deliverer earnings.

**Query params:**
- `period` - `today`, `week`, `month` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": "150.50",
    "completedDeliveries": 25,
    "period": "week"
  }
}
```

---

### `GET /api/deliverers/:address/rating`

Get deliverer rating and reviews.

**Response:**
```json
{
  "success": true,
  "data": {
    "rating": 4.6,
    "totalReviews": 45,
    "reviews": [
      {
        "rating": 5,
        "comment": "Fast delivery!",
        "orderId": 123,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### `GET /api/deliverers/:address/active-delivery`

Get active delivery for a deliverer.

**Response:**
```json
{
  "success": true,
  "order": {
    "orderId": 123,
    "status": "IN_DELIVERY",
    "restaurant": {...},
    "client": {...},
    "deliveryAddress": "123 Rue Example"
  }
}
```

**Note:** Returns `null` if no active delivery.

---

## Orders

### Order Lifecycle

```
CREATED -> PREPARING -> IN_DELIVERY -> DELIVERED
                                    -> DISPUTED
```

---

### `POST /api/orders/create` (Auth Required)

Create a new order.

```json
{
  "restaurantId": "507f1f77bcf86cd799439011",
  "items": [
    {"name": "Pizza Margherita", "quantity": 2, "price": 15.50}
  ],
  "deliveryAddress": "123 Rue Example, Paris 75001",
  "clientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 123,
    "txHash": "0xabc123...",
    "status": "CREATED"
  }
}
```

---

### `GET /api/orders/:id`

Get order details.

---

### `GET /api/orders/client/:address`

Get orders by client address.

**Query params:**
- `status` - Filter by status

---

### `POST /api/orders/:id/confirm-preparation` (Auth: RESTAURANT)

Restaurant confirms order is ready.

```json
{
  "restaurantAddress": "0x..."
}
```

---

### `POST /api/orders/:id/assign-deliverer` (Auth: PLATFORM)

Assign a deliverer.

```json
{
  "delivererAddress": "0x..."
}
```

---

### `POST /api/orders/:id/confirm-pickup` (Auth: DELIVERER)

Deliverer confirms pickup.

```json
{
  "delivererAddress": "0x..."
}
```

---

### `POST /api/orders/:id/update-gps` (Auth: DELIVERER)

Update delivery GPS location.

```json
{
  "lat": 48.8566,
  "lng": 2.3522
}
```

---

### `POST /api/orders/:id/confirm-delivery` (Auth: CLIENT)

Client confirms delivery received.

```json
{
  "clientAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "status": "DELIVERED",
    "tokensEarned": "1.9",
    "paymentSplit": {
      "restaurant": "13.30",
      "deliverer": "3.80",
      "platform": "1.90"
    }
  }
}
```

---

### `POST /api/orders/:id/dispute` (Auth Required)

Open a dispute.

```json
{
  "reason": "Food was cold",
  "evidence": "QmXxx..."
}
```

---

### `POST /api/orders/:id/review` (Auth: CLIENT)

Submit a review.

```json
{
  "rating": 5,
  "comment": "Excellent service!",
  "clientAddress": "0x..."
}
```

---

### `POST /api/reviews` (Auth: CLIENT)

Submit a review (alternative route).

```json
{
  "orderId": 123,
  "rating": 5,
  "comment": "Excellent service!",
  "clientAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "review": {
    "orderId": 123,
    "rating": 5,
    "comment": "Excellent service!",
    "clientAddress": "0x...",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### `GET /api/orders/history/:address`

Get order history.

**Query params:**
- `role` - `client`, `restaurant`, or `deliverer`
- `page`, `limit` - Pagination

---

### `GET /api/orders/:id/receipt`

Get order receipt (PDF/HTML format).

**Response:**
```json
{
  "success": true,
  "receipt": {
    "receiptNumber": "RCP-123456",
    "orderId": 123,
    "date": "2025-01-15T10:00:00Z",
    "deliveredAt": "2025-01-15T11:30:00Z",
    "restaurant": {
      "name": "Pizza Palace",
      "address": "..."
    },
    "items": [...],
    "subtotal": "19.00",
    "deliveryFee": "2.00",
    "platformFee": "2.10",
    "total": "23.10",
    "currency": "POL",
    "txHash": "0xabc123...",
    "review": {...}
  }
}
```

---

## Admin (Auth: PLATFORM)

### `GET /api/admin/stats`

Platform statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1234,
    "gmv": "150.00",
    "activeUsers": {
      "clients": 500,
      "restaurants": 50,
      "deliverers": 80
    },
    "platformRevenue": "15.00"
  }
}
```

---

### `GET /api/admin/disputes`

List all disputes.

**Query params:**
- `status` - `pending`, `resolved` (optional)
- `search` - Search by orderId (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "disputeId": 123,
      "orderId": 123,
      "status": "pending",
      "client": "0x...",
      "restaurant": "0x...",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/admin/disputes/:id`

Get dispute details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "disputeId": 123,
    "orderId": 123,
    "order": {...},
    "client": {...},
    "restaurant": {...},
    "deliverer": {...},
    "status": "pending",
    "disputeReason": "Food was cold",
    "disputeEvidence": ["QmXxx..."],
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### `POST /api/admin/disputes/:id/resolve`

Resolve a dispute (new route).

```json
{
  "winner": "CLIENT",
  "reason": "Client was right, food was indeed cold"
}
```

**Valid winners:** `CLIENT`, `RESTAURANT`, `DELIVERER`

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0xabc123...",
    "disputeId": 123,
    "winner": "CLIENT",
    "message": "Dispute resolved successfully"
  }
}
```

---

### `POST /api/admin/resolve-dispute/:id`

Resolve a dispute (legacy route for compatibility).

```json
{
  "winner": "CLIENT"
}
```

---

### `GET /api/admin/users`

List all users.

---

### `GET /api/admin/restaurants`

List all restaurants (admin view).

---

### `GET /api/admin/deliverers`

List all deliverers (admin view).

---

### `POST /api/admin/deliverers/:address/slash`

Penalize a deliverer.

```json
{
  "amount": "0.05",
  "reason": "Order cancellation abuse",
  "orderId": 123
}
```

---

### `GET /api/admin/orders`

List all orders (admin view).

**Query params:**
- `status` - Filter by status (optional)
- `dateFrom`, `dateTo` - Date range (optional)
- `restaurant` - Filter by restaurant (optional)
- `deliverer` - Filter by deliverer (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 1234,
    "page": 1,
    "limit": 50
  }
}
```

---

### `GET /api/admin/orders/:orderId`

Get order details (admin view).

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {...},
    "client": {...},
    "restaurant": {...},
    "deliverer": {...},
    "timeline": [...],
    "transactions": [...]
  }
}
```

---

### `GET /api/admin/analytics/orders`

Get order analytics.

**Query params:**
- `period` - `day`, `week`, `month`, `year` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1234,
    "avgBasket": "19.50",
    "growthRate": 15.5,
    "chartData": [...]
  }
}
```

---

### `GET /api/admin/analytics/revenue`

Get revenue analytics.

**Query params:**
- `startDate`, `endDate` - Date range (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": "1234.50",
    "platformRevenue": "123.45",
    "restaurantRevenue": "864.15",
    "delivererRevenue": "246.90",
    "chartData": [...]
  }
}
```

---

### `GET /api/admin/analytics/users`

Get user growth analytics.

**Query params:**
- `period` - `day`, `week`, `month`, `year` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "clients": 400,
    "restaurants": 50,
    "deliverers": 50,
    "growthRate": 10.5,
    "chartData": [...]
  }
}
```

---

### `GET /api/admin/analytics/top-deliverers`

Get top deliverers by performance.

**Query params:**
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "0x...",
      "name": "Mike",
      "totalDeliveries": 180,
      "rating": 4.8,
      "totalEarnings": "3420.00"
    }
  ]
}
```

---

### `GET /api/admin/analytics/top-restaurants`

Get top restaurants by revenue.

**Query params:**
- `limit` - Number of results (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Pizza Palace",
      "totalOrders": 250,
      "revenue": "3750.00",
      "rating": 4.8
    }
  ]
}
```

---

### `GET /api/admin/analytics/disputes`

Get dispute analytics histogram.

**Query params:**
- `period` - `day`, `week`, `month`, `year` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDisputes": 45,
    "resolved": 40,
    "pending": 5,
    "histogram": [...]
  }
}
```

---

### `GET /api/admin/ping`

Check admin connection.

**Response:**
```json
{
  "success": true,
  "message": "pong",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

---

### `GET /api/admin/config`

Get platform configuration (contract addresses).

**Response:**
```json
{
  "success": true,
  "data": {
    "orderManagerAddress": "0x...",
    "paymentSplitterAddress": "0x...",
    "tokenAddress": "0x...",
    "stakingAddress": "0x...",
    "network": "polygon"
  }
}
```

---

## Analytics (Auth: PLATFORM)

### `GET /api/analytics/dashboard`

Complete dashboard data.

---

### `GET /api/analytics/orders`

Order analytics.

**Query params:**
- `period` - `day`, `week`, `month`, `year`

---

### `GET /api/analytics/revenue`

Revenue analytics.

**Query params:**
- `startDate`, `endDate`

---

### `GET /api/analytics/users`

User growth analytics.

---

## Oracles (Optional - Sprint 6)

### `GET /api/oracles/price`

Get crypto prices.

**Query params:**
- `pair` - `MATIC/USD`, `ETH/USD`

---

### `POST /api/oracles/convert`

Convert fiat to crypto.

```json
{
  "amount": 15.50,
  "from": "USD",
  "to": "MATIC"
}
```

---

### `POST /api/oracles/gps/verify` (Auth Required)

Verify delivery location.

```json
{
  "orderId": 123,
  "delivererLat": 48.8566,
  "delivererLng": 2.3522,
  "clientLat": 48.8606,
  "clientLng": 2.3372
}
```

---

### `GET /api/oracles/weather`

Weather data for delivery fee adjustment.

**Query params:**
- `lat`, `lng`

---

## Disputes (Optional - Sprint 6)

### `POST /api/disputes/:id/vote` (Auth Required)

Vote on a dispute.

```json
{
  "voterAddress": "0x...",
  "winner": "CLIENT",
  "reason": "Food was indeed cold"
}
```

---

### `GET /api/disputes/:id/votes`

Get dispute votes.

**Response:**
```json
{
  "success": true,
  "data": {
    "disputeId": 123,
    "votes": [
      {
        "voterAddress": "0x...",
        "winner": "CLIENT",
        "reason": "Food was indeed cold",
        "timestamp": "2025-01-15T10:00:00Z"
      }
    ],
    "summary": {
      "CLIENT": 3,
      "RESTAURANT": 1,
      "DELIVERER": 0
    }
  }
}
```

---

### `GET /api/disputes/:id`

Get dispute details.

**Response:**
```json
{
  "success": true,
  "data": {
    "disputeId": 123,
    "orderId": 123,
    "reason": "Food was cold",
    "evidence": ["QmXxx..."],
    "status": "VOTING",
    "votes": [...],
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### `POST /api/disputes/:id/resolve` (Auth: PLATFORM)

Force resolve a dispute (after voting).

**Response:**
```json
{
  "success": true,
  "data": {
    "disputeId": 123,
    "winner": "CLIENT",
    "txHash": "0xabc123..."
  }
}
```

---

### `GET /api/disputes/metrics`

Get arbitration metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDisputes": 100,
    "resolved": 95,
    "pending": 5,
    "averageResolutionTime": 3600,
    "topArbitrators": [...]
  }
}
```

---

## Tokens

### `GET /api/tokens/rate`

Get DONE token conversion rate.

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": {
      "1 DONE": "0.10 EUR",
      "10 DONE": "1.00 EUR"
    },
    "mintingRate": "1 DONE per 10 EUR spent"
  }
}
```

---

### `POST /api/tokens/burn` (Auth Required)

Burn tokens for discount.

```json
{
  "userAddress": "0x...",
  "amount": "10",
  "orderId": 123,
  "discountAmount": "2.00"
}
```

---

### `POST /api/tokens/use-discount` (Auth Required)

Use tokens for order discount.

```json
{
  "userAddress": "0x...",
  "tokensToUse": "50",
  "orderId": 123
}
```

---

## Cart

### `GET /api/cart/:address`

Get user's cart.

**Response:**
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "itemId": "item_123",
        "name": "Pizza Margherita",
        "price": 15.50,
        "quantity": 2,
        "restaurantId": "..."
      }
    ],
    "total": 31.00
  }
}
```

---

### `POST /api/cart/:address/add`

Add item to cart.

```json
{
  "itemId": "item_123",
  "name": "Pizza Margherita",
  "price": 15.50,
  "quantity": 1,
  "restaurantId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {...}
}
```

---

### `PUT /api/cart/:address/update`

Update cart item quantity.

```json
{
  "itemId": "item_123",
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated",
  "cart": {...}
}
```

---

### `DELETE /api/cart/:address/remove/:itemId`

Remove item from cart.

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": {...}
}
```

---

### `DELETE /api/cart/:address/clear`

Clear entire cart.

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Upload

### `POST /api/upload/image`

Upload an image to IPFS.

**Content-Type:** `multipart/form-data`

**Body:**
- `file` - Image file (max 10MB)

**Response:**
```json
{
  "success": true,
  "ipfsHash": "QmXxx...",
  "url": "https://ipfs.io/ipfs/QmXxx..."
}
```

**Note:** In development mode, returns a mock hash if Pinata is not configured.

---

## Payments (Optional - Stripe)

### `POST /api/payments/stripe/create-intent` (Auth Required)

Create Stripe payment intent.

```json
{
  "orderId": 123,
  "amount": 19.00,
  "currency": "eur",
  "clientAddress": "0x..."
}
```

---

### `POST /api/payments/stripe/confirm` (Auth Required)

Confirm Stripe payment.

```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": 123,
  "clientAddress": "0x..."
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid data |
| `401` | Unauthorized - Missing/invalid auth |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found |
| `409` | Conflict - Resource already exists |
| `500` | Server Error |
| `503` | Service Unavailable |

**Error Response Format:**
```json
{
  "error": "Bad Request",
  "message": "Invalid Ethereum address"
}
```

---

## Payment Split

When delivery is confirmed, payment is automatically split:

| Recipient | Percentage |
|-----------|------------|
| Restaurant | 70% |
| Deliverer | 20% |
| Platform | 10% |

---

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| DoneOrderManager | Order management |
| DonePaymentSplitter | Payment distribution |
| DoneToken | DONE ERC20 token |
| DoneStaking | Deliverer staking |
| DoneArbitration | Dispute resolution |
| DonePriceOracle | Chainlink price feeds |
| DoneGPSOracle | GPS verification |

---

## WebSocket Events

Connect to `ws://localhost:3000` for real-time updates:

| Event | Description |
|-------|-------------|
| `orderCreated` | New order placed |
| `orderStatusChanged` | Order status update |
| `gpsUpdate` | Deliverer location update |
| `disputeOpened` | New dispute created |

---

## Testing

```bash
# Run all API tests
cd backend
node src/tests/api-tests.js

# Expected output: 74/75 tests passing
# Note: Some new endpoints may not have tests yet
```

### Test Categories

| Category | Tests | Status |
|----------|-------|--------|
| Health Check | 1 | Pass |
| Users | 7 | Pass |
| Restaurants | 13 | Pass |
| Deliverers | 8 | Pass |
| Orders | 12 | Pass |
| Admin | 8 | Pass |
| Analytics | 5 | Pass |
| Oracles | 5 | Pass |
| Disputes | 3 | 2/3 Pass |
| Tokens | 3 | Pass |
| Payments | 2 | Pass |
| Security | 5 | Pass |
| Performance | 2 | Pass |

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/done_food_delivery

# Blockchain
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=0x...
ORDER_MANAGER_ADDRESS=0x...
PAYMENT_SPLITTER_ADDRESS=0x...
TOKEN_ADDRESS=0x...
STAKING_ADDRESS=0x...

# IPFS
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
IPFS_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

---

**Last updated:** 2025-12-10
