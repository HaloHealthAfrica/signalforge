import axios, { AxiosInstance } from 'axios';
import { 
  TradeOrder, 
  OrderResponse, 
  AccountBalance, 
  Position 
} from '../types/trading';
import { ApiOptimizer } from './apiOptimizer';

export interface TradierConfig {
  apiKey: string;
  accessToken: string;
  accountId: string;
  baseUrl?: string;
  isPaper: boolean;
}

export interface TradierOrder {
  class: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  duration: 'day' | 'gtc' | 'ioc' | 'fok';
  price?: number;
  stop?: number;
  tag?: string;
}

export interface TradierOrderResponse { 
  order_id: number; 
  status: string; 
  partner_id: string; 
}

export interface TradierOrderStatus {
  id: number;
  class: string;
  symbol: string;
  side: string;
  quantity: number;
  status: string;
  type: string;
  created_at: string;
  updated_at: string;
  filled_at?: string;
  filled_quantity: number;
  filled_price: number;
  commission: number;
  tag?: string;
}

export interface TradierAccount {
  account_number: string;
  account_type: string;
  buying_power: number;
  day_trading_buying_power: number;
  equity: number;
  long_market_value: number;
  short_market_value: number;
  total_market_value: number;
  cash: number;
  margin_balance: number;
  maintenance_requirement: number;
  last_update_date: string;
}

export interface TradierPosition {
  symbol: string;
  quantity: number;
  cost_basis: number;
  date_acquired: string;
  market_value: number;
}

export type TradierEvent =
  | { type: 'ORDER_PLACED'; data: OrderResponse }
  | { type: 'ORDER_UPDATED'; data: OrderResponse }
  | { type: 'BALANCE_UPDATED'; data: AccountBalance }
  | { type: 'POSITIONS_UPDATED'; data: Position[] }
  | { type: 'ERROR'; error: Error };

export class TradierAdapter {
  private config: TradierConfig;
  private httpClient: AxiosInstance;
  private apiOptimizer: ApiOptimizer;
  private eventSubscribers: Array<(event: TradierEvent) => void> = [];

  constructor(config: TradierConfig) {
    this.config = config;
    this.apiOptimizer = new ApiOptimizer();
    
    const baseUrl = config.baseUrl 
      || (config.isPaper ? 'https://sandbox.tradier.com' : 'https://api.tradier.com');

    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Accept': 'application/json'
      }
    });
  }

  subscribe(cb: (event: TradierEvent) => void): void {
    this.eventSubscribers.push(cb);
  }

  private emit(event: TradierEvent): void {
    this.eventSubscribers.forEach(cb => cb(event));
  }

  async connect(): Promise<void> {
    try {
      await this.getAccountBalance();
      console.log('✅ Tradier adapter connected');
    } catch (error: any) {
      this.emit({ type: 'ERROR', error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('✅ Tradier adapter disconnected');
  }

  async placeOrder(order: TradeOrder): Promise<OrderResponse> {
    const tradierOrder: TradierOrder = {
      class: 'equity',
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      type: order.type,
      duration: order.timeInForce,
      price: order.price,
      stop: order.stopPrice,
      tag: `tradeloop_${Date.now()}`
    };

    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.post(`/v1/accounts/${this.config.accountId}/orders`, tradierOrder);
        const o = res.data.order as TradierOrderResponse;
        const mapped: OrderResponse = {
          orderId: o.order_id.toString(),
          status: this.mapTradierStatus(o.status),
          filledQuantity: 0,
          filledPrice: 0,
          commission: 0,
          timestamp: new Date()
        };
        this.emit({ type: 'ORDER_PLACED', data: mapped });
        return mapped;
      },
      undefined,
      0
    );
  }

  async getOrderStatus(orderId: string): Promise<OrderResponse> {
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.get(`/v1/accounts/${this.config.accountId}/orders/${orderId}`);
        const o = res.data.order as TradierOrderStatus;
        const mapped: OrderResponse = {
          orderId: o.id.toString(),
          status: this.mapTradierStatus(o.status),
          filledQuantity: o.filled_quantity,
          filledPrice: o.filled_price,
          commission: o.commission,
          timestamp: new Date(o.updated_at)
        };
        this.emit({ type: 'ORDER_UPDATED', data: mapped });
        return mapped;
      },
      `tradier_order_status_${orderId}`,
      15 * 1000
    );
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        await this.httpClient.delete(`/v1/accounts/${this.config.accountId}/orders/${orderId}`);
        return true;
      },
      undefined,
      0
    );
  }

  async getOrders(status?: string): Promise<OrderResponse[]> {
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.get(`/v1/accounts/${this.config.accountId}/orders`, { params: { status } });
        const orders: TradierOrderStatus[] = res.data.orders || [];
        return orders.map(o => ({
          orderId: o.id.toString(),
          status: this.mapTradierStatus(o.status),
          filledQuantity: o.filled_quantity,
          filledPrice: o.filled_price,
          commission: o.commission,
          timestamp: new Date(o.updated_at)
        }));
      },
      `tradier_orders_${status || 'all'}`,
      30 * 1000
    );
  }

  async getAccountBalance(): Promise<AccountBalance> {
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.get(`/v1/accounts/${this.config.accountId}/balances`);
        const b = res.data.balances as TradierAccount;
        const mapped: AccountBalance = {
          accountId: b.account_number,
          cash: b.cash,
          buyingPower: b.buying_power,
          dayTradingBuyingPower: b.day_trading_buying_power,
          equity: b.equity,
          longMarketValue: b.long_market_value,
          shortMarketValue: b.short_market_value,
          totalMarketValue: b.total_market_value,
          timestamp: new Date()
        };
        this.emit({ type: 'BALANCE_UPDATED', data: mapped });
        return mapped;
      },
      `tradier_balance_${this.config.accountId}`,
      60 * 1000
    );
  }

  async getPositions(): Promise<Position[]> {
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.get(`/v1/accounts/${this.config.accountId}/positions`);
        const positions: TradierPosition[] = res.data.positions || [];
        const mapped = positions.map(p => ({
          symbol: p.symbol,
          quantity: p.quantity,
          averagePrice: p.cost_basis,
          marketValue: p.market_value,
          unrealizedPnL: p.market_value - (p.cost_basis * p.quantity),
          timestamp: new Date()
        }));
        this.emit({ type: 'POSITIONS_UPDATED', data: mapped });
        return mapped;
      },
      `tradier_positions_${this.config.accountId}`,
      60 * 1000
    );
  }

  async getQuote(symbol: string): Promise<{ bid: number; ask: number; last: number }> {
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.get(`/v1/markets/quotes`, { params: { symbols: symbol } });
        const q = Array.isArray(res.data.quotes.quote) ? res.data.quotes.quote[0] : res.data.quotes.quote;
        return {
          bid: parseFloat(q.bid || '0'),
          ask: parseFloat(q.ask || '0'),
          last: parseFloat(q.last || '0')
        };
      },
      `tradier_quote_${symbol}`,
      15 * 1000
    );
  }

  async getMultipleQuotes(symbols: string[]): Promise<Record<string, { bid: number; ask: number; last: number }>> {
    const key = `tradier_quotes_${symbols.join(',')}`;
    return this.apiOptimizer.executeWithRateLimit(
      'tradier',
      async () => {
        const res = await this.httpClient.get(`/v1/markets/quotes`, { params: { symbols: symbols.join(',') } });
        const arr = Array.isArray(res.data.quotes.quote) ? res.data.quotes.quote : [res.data.quotes.quote];
        const mapped: Record<string, { bid: number; ask: number; last: number }> = {};
        arr.forEach((q: any) => {
          mapped[q.symbol] = { bid: parseFloat(q.bid || '0'), ask: parseFloat(q.ask || '0'), last: parseFloat(q.last || '0') };
        });
        return mapped;
      },
      key,
      15 * 1000
    );
  }

  private mapTradierStatus(status: string): 'pending' | 'filled' | 'cancelled' | 'rejected' {
    switch (status.toLowerCase()) {
      case 'filled': return 'filled';
      case 'cancelled': return 'cancelled';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  }

  async isMarketOpen(): Promise<boolean> {
    try {
      const res = await this.httpClient.get('/v1/markets/clock');
      return res.data.clock?.state === 'open';
    } catch {
      return false;
    }
  }

  getConfig(): TradierConfig {
    return { ...this.config };
  }

  async calculatePositionSize(symbol: string, riskAmount: number, stopLoss: number): Promise<number> {
    const quote = await this.getQuote(symbol);
    const riskPerShare = Math.abs(quote.last - stopLoss);
    if (riskPerShare <= 0) throw new Error('Invalid stop loss price');
    return Math.floor(riskAmount / riskPerShare);
  }
}
