
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Inbox
 * 
 */
export type Inbox = $Result.DefaultSelection<Prisma.$InboxPayload>
/**
 * Model Message
 * 
 */
export type Message = $Result.DefaultSelection<Prisma.$MessagePayload>
/**
 * Model Attachment
 * 
 */
export type Attachment = $Result.DefaultSelection<Prisma.$AttachmentPayload>
/**
 * Model IngestLog
 * 
 */
export type IngestLog = $Result.DefaultSelection<Prisma.$IngestLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const MessageStatus: {
  PENDING: 'PENDING',
  PARSED: 'PARSED',
  FAILED: 'FAILED'
};

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]

}

export type MessageStatus = $Enums.MessageStatus

export const MessageStatus: typeof $Enums.MessageStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Inboxes
 * const inboxes = await prisma.inbox.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Inboxes
   * const inboxes = await prisma.inbox.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.inbox`: Exposes CRUD operations for the **Inbox** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inboxes
    * const inboxes = await prisma.inbox.findMany()
    * ```
    */
  get inbox(): Prisma.InboxDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.message`: Exposes CRUD operations for the **Message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.message.findMany()
    * ```
    */
  get message(): Prisma.MessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attachment`: Exposes CRUD operations for the **Attachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attachments
    * const attachments = await prisma.attachment.findMany()
    * ```
    */
  get attachment(): Prisma.AttachmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ingestLog`: Exposes CRUD operations for the **IngestLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IngestLogs
    * const ingestLogs = await prisma.ingestLog.findMany()
    * ```
    */
  get ingestLog(): Prisma.IngestLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Inbox: 'Inbox',
    Message: 'Message',
    Attachment: 'Attachment',
    IngestLog: 'IngestLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "inbox" | "message" | "attachment" | "ingestLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Inbox: {
        payload: Prisma.$InboxPayload<ExtArgs>
        fields: Prisma.InboxFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InboxFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InboxFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>
          }
          findFirst: {
            args: Prisma.InboxFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InboxFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>
          }
          findMany: {
            args: Prisma.InboxFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>[]
          }
          create: {
            args: Prisma.InboxCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>
          }
          createMany: {
            args: Prisma.InboxCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InboxCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>[]
          }
          delete: {
            args: Prisma.InboxDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>
          }
          update: {
            args: Prisma.InboxUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>
          }
          deleteMany: {
            args: Prisma.InboxDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InboxUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InboxUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>[]
          }
          upsert: {
            args: Prisma.InboxUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InboxPayload>
          }
          aggregate: {
            args: Prisma.InboxAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInbox>
          }
          groupBy: {
            args: Prisma.InboxGroupByArgs<ExtArgs>
            result: $Utils.Optional<InboxGroupByOutputType>[]
          }
          count: {
            args: Prisma.InboxCountArgs<ExtArgs>
            result: $Utils.Optional<InboxCountAggregateOutputType> | number
          }
        }
      }
      Message: {
        payload: Prisma.$MessagePayload<ExtArgs>
        fields: Prisma.MessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findFirst: {
            args: Prisma.MessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          findMany: {
            args: Prisma.MessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          create: {
            args: Prisma.MessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          createMany: {
            args: Prisma.MessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          delete: {
            args: Prisma.MessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          update: {
            args: Prisma.MessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          deleteMany: {
            args: Prisma.MessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>[]
          }
          upsert: {
            args: Prisma.MessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MessagePayload>
          }
          aggregate: {
            args: Prisma.MessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMessage>
          }
          groupBy: {
            args: Prisma.MessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<MessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.MessageCountArgs<ExtArgs>
            result: $Utils.Optional<MessageCountAggregateOutputType> | number
          }
        }
      }
      Attachment: {
        payload: Prisma.$AttachmentPayload<ExtArgs>
        fields: Prisma.AttachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          findFirst: {
            args: Prisma.AttachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          findMany: {
            args: Prisma.AttachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          create: {
            args: Prisma.AttachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          createMany: {
            args: Prisma.AttachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttachmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          delete: {
            args: Prisma.AttachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          update: {
            args: Prisma.AttachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          deleteMany: {
            args: Prisma.AttachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AttachmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>[]
          }
          upsert: {
            args: Prisma.AttachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttachmentPayload>
          }
          aggregate: {
            args: Prisma.AttachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttachment>
          }
          groupBy: {
            args: Prisma.AttachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttachmentCountArgs<ExtArgs>
            result: $Utils.Optional<AttachmentCountAggregateOutputType> | number
          }
        }
      }
      IngestLog: {
        payload: Prisma.$IngestLogPayload<ExtArgs>
        fields: Prisma.IngestLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IngestLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IngestLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>
          }
          findFirst: {
            args: Prisma.IngestLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IngestLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>
          }
          findMany: {
            args: Prisma.IngestLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>[]
          }
          create: {
            args: Prisma.IngestLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>
          }
          createMany: {
            args: Prisma.IngestLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IngestLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>[]
          }
          delete: {
            args: Prisma.IngestLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>
          }
          update: {
            args: Prisma.IngestLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>
          }
          deleteMany: {
            args: Prisma.IngestLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IngestLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IngestLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>[]
          }
          upsert: {
            args: Prisma.IngestLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngestLogPayload>
          }
          aggregate: {
            args: Prisma.IngestLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngestLog>
          }
          groupBy: {
            args: Prisma.IngestLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<IngestLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.IngestLogCountArgs<ExtArgs>
            result: $Utils.Optional<IngestLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    inbox?: InboxOmit
    message?: MessageOmit
    attachment?: AttachmentOmit
    ingestLog?: IngestLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type InboxCountOutputType
   */

  export type InboxCountOutputType = {
    messages: number
  }

  export type InboxCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | InboxCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * InboxCountOutputType without action
   */
  export type InboxCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InboxCountOutputType
     */
    select?: InboxCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InboxCountOutputType without action
   */
  export type InboxCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
  }


  /**
   * Count Type MessageCountOutputType
   */

  export type MessageCountOutputType = {
    attachments: number
  }

  export type MessageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attachments?: boolean | MessageCountOutputTypeCountAttachmentsArgs
  }

  // Custom InputTypes
  /**
   * MessageCountOutputType without action
   */
  export type MessageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessageCountOutputType
     */
    select?: MessageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MessageCountOutputType without action
   */
  export type MessageCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Inbox
   */

  export type AggregateInbox = {
    _count: InboxCountAggregateOutputType | null
    _avg: InboxAvgAggregateOutputType | null
    _sum: InboxSumAggregateOutputType | null
    _min: InboxMinAggregateOutputType | null
    _max: InboxMaxAggregateOutputType | null
  }

  export type InboxAvgAggregateOutputType = {
    extendCount: number | null
  }

  export type InboxSumAggregateOutputType = {
    extendCount: number | null
  }

  export type InboxMinAggregateOutputType = {
    id: string | null
    address: string | null
    localPart: string | null
    domain: string | null
    createdAt: Date | null
    expiresAt: Date | null
    lastExtendedAt: Date | null
    extendCount: number | null
    isDeleted: boolean | null
    deletedAt: Date | null
    tokenHash: string | null
  }

  export type InboxMaxAggregateOutputType = {
    id: string | null
    address: string | null
    localPart: string | null
    domain: string | null
    createdAt: Date | null
    expiresAt: Date | null
    lastExtendedAt: Date | null
    extendCount: number | null
    isDeleted: boolean | null
    deletedAt: Date | null
    tokenHash: string | null
  }

  export type InboxCountAggregateOutputType = {
    id: number
    address: number
    localPart: number
    domain: number
    createdAt: number
    expiresAt: number
    lastExtendedAt: number
    extendCount: number
    isDeleted: number
    deletedAt: number
    tokenHash: number
    _all: number
  }


  export type InboxAvgAggregateInputType = {
    extendCount?: true
  }

  export type InboxSumAggregateInputType = {
    extendCount?: true
  }

  export type InboxMinAggregateInputType = {
    id?: true
    address?: true
    localPart?: true
    domain?: true
    createdAt?: true
    expiresAt?: true
    lastExtendedAt?: true
    extendCount?: true
    isDeleted?: true
    deletedAt?: true
    tokenHash?: true
  }

  export type InboxMaxAggregateInputType = {
    id?: true
    address?: true
    localPart?: true
    domain?: true
    createdAt?: true
    expiresAt?: true
    lastExtendedAt?: true
    extendCount?: true
    isDeleted?: true
    deletedAt?: true
    tokenHash?: true
  }

  export type InboxCountAggregateInputType = {
    id?: true
    address?: true
    localPart?: true
    domain?: true
    createdAt?: true
    expiresAt?: true
    lastExtendedAt?: true
    extendCount?: true
    isDeleted?: true
    deletedAt?: true
    tokenHash?: true
    _all?: true
  }

  export type InboxAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inbox to aggregate.
     */
    where?: InboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inboxes to fetch.
     */
    orderBy?: InboxOrderByWithRelationInput | InboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Inboxes
    **/
    _count?: true | InboxCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InboxAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InboxSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InboxMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InboxMaxAggregateInputType
  }

  export type GetInboxAggregateType<T extends InboxAggregateArgs> = {
        [P in keyof T & keyof AggregateInbox]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInbox[P]>
      : GetScalarType<T[P], AggregateInbox[P]>
  }




  export type InboxGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InboxWhereInput
    orderBy?: InboxOrderByWithAggregationInput | InboxOrderByWithAggregationInput[]
    by: InboxScalarFieldEnum[] | InboxScalarFieldEnum
    having?: InboxScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InboxCountAggregateInputType | true
    _avg?: InboxAvgAggregateInputType
    _sum?: InboxSumAggregateInputType
    _min?: InboxMinAggregateInputType
    _max?: InboxMaxAggregateInputType
  }

  export type InboxGroupByOutputType = {
    id: string
    address: string
    localPart: string
    domain: string
    createdAt: Date
    expiresAt: Date
    lastExtendedAt: Date | null
    extendCount: number
    isDeleted: boolean
    deletedAt: Date | null
    tokenHash: string
    _count: InboxCountAggregateOutputType | null
    _avg: InboxAvgAggregateOutputType | null
    _sum: InboxSumAggregateOutputType | null
    _min: InboxMinAggregateOutputType | null
    _max: InboxMaxAggregateOutputType | null
  }

  type GetInboxGroupByPayload<T extends InboxGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InboxGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InboxGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InboxGroupByOutputType[P]>
            : GetScalarType<T[P], InboxGroupByOutputType[P]>
        }
      >
    >


  export type InboxSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    localPart?: boolean
    domain?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    lastExtendedAt?: boolean
    extendCount?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    tokenHash?: boolean
    messages?: boolean | Inbox$messagesArgs<ExtArgs>
    _count?: boolean | InboxCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inbox"]>

  export type InboxSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    localPart?: boolean
    domain?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    lastExtendedAt?: boolean
    extendCount?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    tokenHash?: boolean
  }, ExtArgs["result"]["inbox"]>

  export type InboxSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    localPart?: boolean
    domain?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    lastExtendedAt?: boolean
    extendCount?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    tokenHash?: boolean
  }, ExtArgs["result"]["inbox"]>

  export type InboxSelectScalar = {
    id?: boolean
    address?: boolean
    localPart?: boolean
    domain?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    lastExtendedAt?: boolean
    extendCount?: boolean
    isDeleted?: boolean
    deletedAt?: boolean
    tokenHash?: boolean
  }

  export type InboxOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "address" | "localPart" | "domain" | "createdAt" | "expiresAt" | "lastExtendedAt" | "extendCount" | "isDeleted" | "deletedAt" | "tokenHash", ExtArgs["result"]["inbox"]>
  export type InboxInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | Inbox$messagesArgs<ExtArgs>
    _count?: boolean | InboxCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InboxIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type InboxIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InboxPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Inbox"
    objects: {
      messages: Prisma.$MessagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      address: string
      localPart: string
      domain: string
      createdAt: Date
      expiresAt: Date
      lastExtendedAt: Date | null
      extendCount: number
      isDeleted: boolean
      deletedAt: Date | null
      tokenHash: string
    }, ExtArgs["result"]["inbox"]>
    composites: {}
  }

  type InboxGetPayload<S extends boolean | null | undefined | InboxDefaultArgs> = $Result.GetResult<Prisma.$InboxPayload, S>

  type InboxCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InboxFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InboxCountAggregateInputType | true
    }

  export interface InboxDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Inbox'], meta: { name: 'Inbox' } }
    /**
     * Find zero or one Inbox that matches the filter.
     * @param {InboxFindUniqueArgs} args - Arguments to find a Inbox
     * @example
     * // Get one Inbox
     * const inbox = await prisma.inbox.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InboxFindUniqueArgs>(args: SelectSubset<T, InboxFindUniqueArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inbox that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InboxFindUniqueOrThrowArgs} args - Arguments to find a Inbox
     * @example
     * // Get one Inbox
     * const inbox = await prisma.inbox.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InboxFindUniqueOrThrowArgs>(args: SelectSubset<T, InboxFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inbox that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxFindFirstArgs} args - Arguments to find a Inbox
     * @example
     * // Get one Inbox
     * const inbox = await prisma.inbox.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InboxFindFirstArgs>(args?: SelectSubset<T, InboxFindFirstArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inbox that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxFindFirstOrThrowArgs} args - Arguments to find a Inbox
     * @example
     * // Get one Inbox
     * const inbox = await prisma.inbox.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InboxFindFirstOrThrowArgs>(args?: SelectSubset<T, InboxFindFirstOrThrowArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inboxes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inboxes
     * const inboxes = await prisma.inbox.findMany()
     * 
     * // Get first 10 Inboxes
     * const inboxes = await prisma.inbox.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inboxWithIdOnly = await prisma.inbox.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InboxFindManyArgs>(args?: SelectSubset<T, InboxFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inbox.
     * @param {InboxCreateArgs} args - Arguments to create a Inbox.
     * @example
     * // Create one Inbox
     * const Inbox = await prisma.inbox.create({
     *   data: {
     *     // ... data to create a Inbox
     *   }
     * })
     * 
     */
    create<T extends InboxCreateArgs>(args: SelectSubset<T, InboxCreateArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inboxes.
     * @param {InboxCreateManyArgs} args - Arguments to create many Inboxes.
     * @example
     * // Create many Inboxes
     * const inbox = await prisma.inbox.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InboxCreateManyArgs>(args?: SelectSubset<T, InboxCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inboxes and returns the data saved in the database.
     * @param {InboxCreateManyAndReturnArgs} args - Arguments to create many Inboxes.
     * @example
     * // Create many Inboxes
     * const inbox = await prisma.inbox.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inboxes and only return the `id`
     * const inboxWithIdOnly = await prisma.inbox.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InboxCreateManyAndReturnArgs>(args?: SelectSubset<T, InboxCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inbox.
     * @param {InboxDeleteArgs} args - Arguments to delete one Inbox.
     * @example
     * // Delete one Inbox
     * const Inbox = await prisma.inbox.delete({
     *   where: {
     *     // ... filter to delete one Inbox
     *   }
     * })
     * 
     */
    delete<T extends InboxDeleteArgs>(args: SelectSubset<T, InboxDeleteArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inbox.
     * @param {InboxUpdateArgs} args - Arguments to update one Inbox.
     * @example
     * // Update one Inbox
     * const inbox = await prisma.inbox.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InboxUpdateArgs>(args: SelectSubset<T, InboxUpdateArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inboxes.
     * @param {InboxDeleteManyArgs} args - Arguments to filter Inboxes to delete.
     * @example
     * // Delete a few Inboxes
     * const { count } = await prisma.inbox.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InboxDeleteManyArgs>(args?: SelectSubset<T, InboxDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inboxes
     * const inbox = await prisma.inbox.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InboxUpdateManyArgs>(args: SelectSubset<T, InboxUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inboxes and returns the data updated in the database.
     * @param {InboxUpdateManyAndReturnArgs} args - Arguments to update many Inboxes.
     * @example
     * // Update many Inboxes
     * const inbox = await prisma.inbox.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inboxes and only return the `id`
     * const inboxWithIdOnly = await prisma.inbox.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InboxUpdateManyAndReturnArgs>(args: SelectSubset<T, InboxUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inbox.
     * @param {InboxUpsertArgs} args - Arguments to update or create a Inbox.
     * @example
     * // Update or create a Inbox
     * const inbox = await prisma.inbox.upsert({
     *   create: {
     *     // ... data to create a Inbox
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inbox we want to update
     *   }
     * })
     */
    upsert<T extends InboxUpsertArgs>(args: SelectSubset<T, InboxUpsertArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inboxes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxCountArgs} args - Arguments to filter Inboxes to count.
     * @example
     * // Count the number of Inboxes
     * const count = await prisma.inbox.count({
     *   where: {
     *     // ... the filter for the Inboxes we want to count
     *   }
     * })
    **/
    count<T extends InboxCountArgs>(
      args?: Subset<T, InboxCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InboxCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InboxAggregateArgs>(args: Subset<T, InboxAggregateArgs>): Prisma.PrismaPromise<GetInboxAggregateType<T>>

    /**
     * Group by Inbox.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InboxGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InboxGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InboxGroupByArgs['orderBy'] }
        : { orderBy?: InboxGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InboxGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInboxGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Inbox model
   */
  readonly fields: InboxFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Inbox.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InboxClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    messages<T extends Inbox$messagesArgs<ExtArgs> = {}>(args?: Subset<T, Inbox$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Inbox model
   */
  interface InboxFieldRefs {
    readonly id: FieldRef<"Inbox", 'String'>
    readonly address: FieldRef<"Inbox", 'String'>
    readonly localPart: FieldRef<"Inbox", 'String'>
    readonly domain: FieldRef<"Inbox", 'String'>
    readonly createdAt: FieldRef<"Inbox", 'DateTime'>
    readonly expiresAt: FieldRef<"Inbox", 'DateTime'>
    readonly lastExtendedAt: FieldRef<"Inbox", 'DateTime'>
    readonly extendCount: FieldRef<"Inbox", 'Int'>
    readonly isDeleted: FieldRef<"Inbox", 'Boolean'>
    readonly deletedAt: FieldRef<"Inbox", 'DateTime'>
    readonly tokenHash: FieldRef<"Inbox", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Inbox findUnique
   */
  export type InboxFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * Filter, which Inbox to fetch.
     */
    where: InboxWhereUniqueInput
  }

  /**
   * Inbox findUniqueOrThrow
   */
  export type InboxFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * Filter, which Inbox to fetch.
     */
    where: InboxWhereUniqueInput
  }

  /**
   * Inbox findFirst
   */
  export type InboxFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * Filter, which Inbox to fetch.
     */
    where?: InboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inboxes to fetch.
     */
    orderBy?: InboxOrderByWithRelationInput | InboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inboxes.
     */
    cursor?: InboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inboxes.
     */
    distinct?: InboxScalarFieldEnum | InboxScalarFieldEnum[]
  }

  /**
   * Inbox findFirstOrThrow
   */
  export type InboxFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * Filter, which Inbox to fetch.
     */
    where?: InboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inboxes to fetch.
     */
    orderBy?: InboxOrderByWithRelationInput | InboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Inboxes.
     */
    cursor?: InboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inboxes.
     */
    distinct?: InboxScalarFieldEnum | InboxScalarFieldEnum[]
  }

  /**
   * Inbox findMany
   */
  export type InboxFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * Filter, which Inboxes to fetch.
     */
    where?: InboxWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Inboxes to fetch.
     */
    orderBy?: InboxOrderByWithRelationInput | InboxOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Inboxes.
     */
    cursor?: InboxWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Inboxes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Inboxes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Inboxes.
     */
    distinct?: InboxScalarFieldEnum | InboxScalarFieldEnum[]
  }

  /**
   * Inbox create
   */
  export type InboxCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * The data needed to create a Inbox.
     */
    data: XOR<InboxCreateInput, InboxUncheckedCreateInput>
  }

  /**
   * Inbox createMany
   */
  export type InboxCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Inboxes.
     */
    data: InboxCreateManyInput | InboxCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inbox createManyAndReturn
   */
  export type InboxCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * The data used to create many Inboxes.
     */
    data: InboxCreateManyInput | InboxCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Inbox update
   */
  export type InboxUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * The data needed to update a Inbox.
     */
    data: XOR<InboxUpdateInput, InboxUncheckedUpdateInput>
    /**
     * Choose, which Inbox to update.
     */
    where: InboxWhereUniqueInput
  }

  /**
   * Inbox updateMany
   */
  export type InboxUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Inboxes.
     */
    data: XOR<InboxUpdateManyMutationInput, InboxUncheckedUpdateManyInput>
    /**
     * Filter which Inboxes to update
     */
    where?: InboxWhereInput
    /**
     * Limit how many Inboxes to update.
     */
    limit?: number
  }

  /**
   * Inbox updateManyAndReturn
   */
  export type InboxUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * The data used to update Inboxes.
     */
    data: XOR<InboxUpdateManyMutationInput, InboxUncheckedUpdateManyInput>
    /**
     * Filter which Inboxes to update
     */
    where?: InboxWhereInput
    /**
     * Limit how many Inboxes to update.
     */
    limit?: number
  }

  /**
   * Inbox upsert
   */
  export type InboxUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * The filter to search for the Inbox to update in case it exists.
     */
    where: InboxWhereUniqueInput
    /**
     * In case the Inbox found by the `where` argument doesn't exist, create a new Inbox with this data.
     */
    create: XOR<InboxCreateInput, InboxUncheckedCreateInput>
    /**
     * In case the Inbox was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InboxUpdateInput, InboxUncheckedUpdateInput>
  }

  /**
   * Inbox delete
   */
  export type InboxDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
    /**
     * Filter which Inbox to delete.
     */
    where: InboxWhereUniqueInput
  }

  /**
   * Inbox deleteMany
   */
  export type InboxDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Inboxes to delete
     */
    where?: InboxWhereInput
    /**
     * Limit how many Inboxes to delete.
     */
    limit?: number
  }

  /**
   * Inbox.messages
   */
  export type Inbox$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    cursor?: MessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Inbox without action
   */
  export type InboxDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Inbox
     */
    select?: InboxSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Inbox
     */
    omit?: InboxOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InboxInclude<ExtArgs> | null
  }


  /**
   * Model Message
   */

  export type AggregateMessage = {
    _count: MessageCountAggregateOutputType | null
    _avg: MessageAvgAggregateOutputType | null
    _sum: MessageSumAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  export type MessageAvgAggregateOutputType = {
    rawSizeBytes: number | null
    sizeBytes: number | null
  }

  export type MessageSumAggregateOutputType = {
    rawSizeBytes: number | null
    sizeBytes: number | null
  }

  export type MessageMinAggregateOutputType = {
    id: string | null
    inboxId: string | null
    fromAddress: string | null
    fromName: string | null
    toAddress: string | null
    subject: string | null
    textBody: string | null
    htmlBody: string | null
    rawObjectKey: string | null
    rawSizeBytes: number | null
    sizeBytes: number | null
    status: $Enums.MessageStatus | null
    receivedAt: Date | null
    parsedAt: Date | null
    expiresAt: Date | null
    errorMessage: string | null
  }

  export type MessageMaxAggregateOutputType = {
    id: string | null
    inboxId: string | null
    fromAddress: string | null
    fromName: string | null
    toAddress: string | null
    subject: string | null
    textBody: string | null
    htmlBody: string | null
    rawObjectKey: string | null
    rawSizeBytes: number | null
    sizeBytes: number | null
    status: $Enums.MessageStatus | null
    receivedAt: Date | null
    parsedAt: Date | null
    expiresAt: Date | null
    errorMessage: string | null
  }

  export type MessageCountAggregateOutputType = {
    id: number
    inboxId: number
    fromAddress: number
    fromName: number
    toAddress: number
    subject: number
    textBody: number
    htmlBody: number
    rawObjectKey: number
    rawSizeBytes: number
    sizeBytes: number
    status: number
    receivedAt: number
    parsedAt: number
    expiresAt: number
    errorMessage: number
    _all: number
  }


  export type MessageAvgAggregateInputType = {
    rawSizeBytes?: true
    sizeBytes?: true
  }

  export type MessageSumAggregateInputType = {
    rawSizeBytes?: true
    sizeBytes?: true
  }

  export type MessageMinAggregateInputType = {
    id?: true
    inboxId?: true
    fromAddress?: true
    fromName?: true
    toAddress?: true
    subject?: true
    textBody?: true
    htmlBody?: true
    rawObjectKey?: true
    rawSizeBytes?: true
    sizeBytes?: true
    status?: true
    receivedAt?: true
    parsedAt?: true
    expiresAt?: true
    errorMessage?: true
  }

  export type MessageMaxAggregateInputType = {
    id?: true
    inboxId?: true
    fromAddress?: true
    fromName?: true
    toAddress?: true
    subject?: true
    textBody?: true
    htmlBody?: true
    rawObjectKey?: true
    rawSizeBytes?: true
    sizeBytes?: true
    status?: true
    receivedAt?: true
    parsedAt?: true
    expiresAt?: true
    errorMessage?: true
  }

  export type MessageCountAggregateInputType = {
    id?: true
    inboxId?: true
    fromAddress?: true
    fromName?: true
    toAddress?: true
    subject?: true
    textBody?: true
    htmlBody?: true
    rawObjectKey?: true
    rawSizeBytes?: true
    sizeBytes?: true
    status?: true
    receivedAt?: true
    parsedAt?: true
    expiresAt?: true
    errorMessage?: true
    _all?: true
  }

  export type MessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Message to aggregate.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Messages
    **/
    _count?: true | MessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MessageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MessageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessageMaxAggregateInputType
  }

  export type GetMessageAggregateType<T extends MessageAggregateArgs> = {
        [P in keyof T & keyof AggregateMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessage[P]>
      : GetScalarType<T[P], AggregateMessage[P]>
  }




  export type MessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MessageWhereInput
    orderBy?: MessageOrderByWithAggregationInput | MessageOrderByWithAggregationInput[]
    by: MessageScalarFieldEnum[] | MessageScalarFieldEnum
    having?: MessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessageCountAggregateInputType | true
    _avg?: MessageAvgAggregateInputType
    _sum?: MessageSumAggregateInputType
    _min?: MessageMinAggregateInputType
    _max?: MessageMaxAggregateInputType
  }

  export type MessageGroupByOutputType = {
    id: string
    inboxId: string
    fromAddress: string
    fromName: string | null
    toAddress: string
    subject: string | null
    textBody: string | null
    htmlBody: string | null
    rawObjectKey: string | null
    rawSizeBytes: number | null
    sizeBytes: number
    status: $Enums.MessageStatus
    receivedAt: Date
    parsedAt: Date | null
    expiresAt: Date
    errorMessage: string | null
    _count: MessageCountAggregateOutputType | null
    _avg: MessageAvgAggregateOutputType | null
    _sum: MessageSumAggregateOutputType | null
    _min: MessageMinAggregateOutputType | null
    _max: MessageMaxAggregateOutputType | null
  }

  type GetMessageGroupByPayload<T extends MessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessageGroupByOutputType[P]>
            : GetScalarType<T[P], MessageGroupByOutputType[P]>
        }
      >
    >


  export type MessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inboxId?: boolean
    fromAddress?: boolean
    fromName?: boolean
    toAddress?: boolean
    subject?: boolean
    textBody?: boolean
    htmlBody?: boolean
    rawObjectKey?: boolean
    rawSizeBytes?: boolean
    sizeBytes?: boolean
    status?: boolean
    receivedAt?: boolean
    parsedAt?: boolean
    expiresAt?: boolean
    errorMessage?: boolean
    inbox?: boolean | InboxDefaultArgs<ExtArgs>
    attachments?: boolean | Message$attachmentsArgs<ExtArgs>
    _count?: boolean | MessageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inboxId?: boolean
    fromAddress?: boolean
    fromName?: boolean
    toAddress?: boolean
    subject?: boolean
    textBody?: boolean
    htmlBody?: boolean
    rawObjectKey?: boolean
    rawSizeBytes?: boolean
    sizeBytes?: boolean
    status?: boolean
    receivedAt?: boolean
    parsedAt?: boolean
    expiresAt?: boolean
    errorMessage?: boolean
    inbox?: boolean | InboxDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    inboxId?: boolean
    fromAddress?: boolean
    fromName?: boolean
    toAddress?: boolean
    subject?: boolean
    textBody?: boolean
    htmlBody?: boolean
    rawObjectKey?: boolean
    rawSizeBytes?: boolean
    sizeBytes?: boolean
    status?: boolean
    receivedAt?: boolean
    parsedAt?: boolean
    expiresAt?: boolean
    errorMessage?: boolean
    inbox?: boolean | InboxDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["message"]>

  export type MessageSelectScalar = {
    id?: boolean
    inboxId?: boolean
    fromAddress?: boolean
    fromName?: boolean
    toAddress?: boolean
    subject?: boolean
    textBody?: boolean
    htmlBody?: boolean
    rawObjectKey?: boolean
    rawSizeBytes?: boolean
    sizeBytes?: boolean
    status?: boolean
    receivedAt?: boolean
    parsedAt?: boolean
    expiresAt?: boolean
    errorMessage?: boolean
  }

  export type MessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "inboxId" | "fromAddress" | "fromName" | "toAddress" | "subject" | "textBody" | "htmlBody" | "rawObjectKey" | "rawSizeBytes" | "sizeBytes" | "status" | "receivedAt" | "parsedAt" | "expiresAt" | "errorMessage", ExtArgs["result"]["message"]>
  export type MessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inbox?: boolean | InboxDefaultArgs<ExtArgs>
    attachments?: boolean | Message$attachmentsArgs<ExtArgs>
    _count?: boolean | MessageCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inbox?: boolean | InboxDefaultArgs<ExtArgs>
  }
  export type MessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inbox?: boolean | InboxDefaultArgs<ExtArgs>
  }

  export type $MessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Message"
    objects: {
      inbox: Prisma.$InboxPayload<ExtArgs>
      attachments: Prisma.$AttachmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      inboxId: string
      fromAddress: string
      fromName: string | null
      toAddress: string
      subject: string | null
      textBody: string | null
      htmlBody: string | null
      rawObjectKey: string | null
      rawSizeBytes: number | null
      sizeBytes: number
      status: $Enums.MessageStatus
      receivedAt: Date
      parsedAt: Date | null
      expiresAt: Date
      errorMessage: string | null
    }, ExtArgs["result"]["message"]>
    composites: {}
  }

  type MessageGetPayload<S extends boolean | null | undefined | MessageDefaultArgs> = $Result.GetResult<Prisma.$MessagePayload, S>

  type MessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MessageCountAggregateInputType | true
    }

  export interface MessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Message'], meta: { name: 'Message' } }
    /**
     * Find zero or one Message that matches the filter.
     * @param {MessageFindUniqueArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MessageFindUniqueArgs>(args: SelectSubset<T, MessageFindUniqueArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Message that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MessageFindUniqueOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MessageFindUniqueOrThrowArgs>(args: SelectSubset<T, MessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MessageFindFirstArgs>(args?: SelectSubset<T, MessageFindFirstArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Message that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindFirstOrThrowArgs} args - Arguments to find a Message
     * @example
     * // Get one Message
     * const message = await prisma.message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MessageFindFirstOrThrowArgs>(args?: SelectSubset<T, MessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.message.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.message.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messageWithIdOnly = await prisma.message.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MessageFindManyArgs>(args?: SelectSubset<T, MessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Message.
     * @param {MessageCreateArgs} args - Arguments to create a Message.
     * @example
     * // Create one Message
     * const Message = await prisma.message.create({
     *   data: {
     *     // ... data to create a Message
     *   }
     * })
     * 
     */
    create<T extends MessageCreateArgs>(args: SelectSubset<T, MessageCreateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Messages.
     * @param {MessageCreateManyArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MessageCreateManyArgs>(args?: SelectSubset<T, MessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Messages and returns the data saved in the database.
     * @param {MessageCreateManyAndReturnArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const message = await prisma.message.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MessageCreateManyAndReturnArgs>(args?: SelectSubset<T, MessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Message.
     * @param {MessageDeleteArgs} args - Arguments to delete one Message.
     * @example
     * // Delete one Message
     * const Message = await prisma.message.delete({
     *   where: {
     *     // ... filter to delete one Message
     *   }
     * })
     * 
     */
    delete<T extends MessageDeleteArgs>(args: SelectSubset<T, MessageDeleteArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Message.
     * @param {MessageUpdateArgs} args - Arguments to update one Message.
     * @example
     * // Update one Message
     * const message = await prisma.message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MessageUpdateArgs>(args: SelectSubset<T, MessageUpdateArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Messages.
     * @param {MessageDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MessageDeleteManyArgs>(args?: SelectSubset<T, MessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MessageUpdateManyArgs>(args: SelectSubset<T, MessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages and returns the data updated in the database.
     * @param {MessageUpdateManyAndReturnArgs} args - Arguments to update many Messages.
     * @example
     * // Update many Messages
     * const message = await prisma.message.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Messages and only return the `id`
     * const messageWithIdOnly = await prisma.message.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MessageUpdateManyAndReturnArgs>(args: SelectSubset<T, MessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Message.
     * @param {MessageUpsertArgs} args - Arguments to update or create a Message.
     * @example
     * // Update or create a Message
     * const message = await prisma.message.upsert({
     *   create: {
     *     // ... data to create a Message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Message we want to update
     *   }
     * })
     */
    upsert<T extends MessageUpsertArgs>(args: SelectSubset<T, MessageUpsertArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.message.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends MessageCountArgs>(
      args?: Subset<T, MessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessageAggregateArgs>(args: Subset<T, MessageAggregateArgs>): Prisma.PrismaPromise<GetMessageAggregateType<T>>

    /**
     * Group by Message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MessageGroupByArgs['orderBy'] }
        : { orderBy?: MessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Message model
   */
  readonly fields: MessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inbox<T extends InboxDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InboxDefaultArgs<ExtArgs>>): Prisma__InboxClient<$Result.GetResult<Prisma.$InboxPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attachments<T extends Message$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, Message$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Message model
   */
  interface MessageFieldRefs {
    readonly id: FieldRef<"Message", 'String'>
    readonly inboxId: FieldRef<"Message", 'String'>
    readonly fromAddress: FieldRef<"Message", 'String'>
    readonly fromName: FieldRef<"Message", 'String'>
    readonly toAddress: FieldRef<"Message", 'String'>
    readonly subject: FieldRef<"Message", 'String'>
    readonly textBody: FieldRef<"Message", 'String'>
    readonly htmlBody: FieldRef<"Message", 'String'>
    readonly rawObjectKey: FieldRef<"Message", 'String'>
    readonly rawSizeBytes: FieldRef<"Message", 'Int'>
    readonly sizeBytes: FieldRef<"Message", 'Int'>
    readonly status: FieldRef<"Message", 'MessageStatus'>
    readonly receivedAt: FieldRef<"Message", 'DateTime'>
    readonly parsedAt: FieldRef<"Message", 'DateTime'>
    readonly expiresAt: FieldRef<"Message", 'DateTime'>
    readonly errorMessage: FieldRef<"Message", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Message findUnique
   */
  export type MessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findUniqueOrThrow
   */
  export type MessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message findFirst
   */
  export type MessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findFirstOrThrow
   */
  export type MessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Message to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message findMany
   */
  export type MessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter, which Messages to fetch.
     */
    where?: MessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Messages to fetch.
     */
    orderBy?: MessageOrderByWithRelationInput | MessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Messages.
     */
    cursor?: MessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Messages.
     */
    distinct?: MessageScalarFieldEnum | MessageScalarFieldEnum[]
  }

  /**
   * Message create
   */
  export type MessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to create a Message.
     */
    data: XOR<MessageCreateInput, MessageUncheckedCreateInput>
  }

  /**
   * Message createMany
   */
  export type MessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Message createManyAndReturn
   */
  export type MessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * The data used to create many Messages.
     */
    data: MessageCreateManyInput | MessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message update
   */
  export type MessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The data needed to update a Message.
     */
    data: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
    /**
     * Choose, which Message to update.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message updateMany
   */
  export type MessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to update.
     */
    limit?: number
  }

  /**
   * Message updateManyAndReturn
   */
  export type MessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * The data used to update Messages.
     */
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyInput>
    /**
     * Filter which Messages to update
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Message upsert
   */
  export type MessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * The filter to search for the Message to update in case it exists.
     */
    where: MessageWhereUniqueInput
    /**
     * In case the Message found by the `where` argument doesn't exist, create a new Message with this data.
     */
    create: XOR<MessageCreateInput, MessageUncheckedCreateInput>
    /**
     * In case the Message was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MessageUpdateInput, MessageUncheckedUpdateInput>
  }

  /**
   * Message delete
   */
  export type MessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
    /**
     * Filter which Message to delete.
     */
    where: MessageWhereUniqueInput
  }

  /**
   * Message deleteMany
   */
  export type MessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Messages to delete
     */
    where?: MessageWhereInput
    /**
     * Limit how many Messages to delete.
     */
    limit?: number
  }

  /**
   * Message.attachments
   */
  export type Message$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    cursor?: AttachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Message without action
   */
  export type MessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Message
     */
    select?: MessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Message
     */
    omit?: MessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MessageInclude<ExtArgs> | null
  }


  /**
   * Model Attachment
   */

  export type AggregateAttachment = {
    _count: AttachmentCountAggregateOutputType | null
    _avg: AttachmentAvgAggregateOutputType | null
    _sum: AttachmentSumAggregateOutputType | null
    _min: AttachmentMinAggregateOutputType | null
    _max: AttachmentMaxAggregateOutputType | null
  }

  export type AttachmentAvgAggregateOutputType = {
    sizeBytes: number | null
  }

  export type AttachmentSumAggregateOutputType = {
    sizeBytes: number | null
  }

  export type AttachmentMinAggregateOutputType = {
    id: string | null
    messageId: string | null
    filename: string | null
    contentType: string | null
    sizeBytes: number | null
    objectKey: string | null
    checksum: string | null
    createdAt: Date | null
    expiresAt: Date | null
  }

  export type AttachmentMaxAggregateOutputType = {
    id: string | null
    messageId: string | null
    filename: string | null
    contentType: string | null
    sizeBytes: number | null
    objectKey: string | null
    checksum: string | null
    createdAt: Date | null
    expiresAt: Date | null
  }

  export type AttachmentCountAggregateOutputType = {
    id: number
    messageId: number
    filename: number
    contentType: number
    sizeBytes: number
    objectKey: number
    checksum: number
    createdAt: number
    expiresAt: number
    _all: number
  }


  export type AttachmentAvgAggregateInputType = {
    sizeBytes?: true
  }

  export type AttachmentSumAggregateInputType = {
    sizeBytes?: true
  }

  export type AttachmentMinAggregateInputType = {
    id?: true
    messageId?: true
    filename?: true
    contentType?: true
    sizeBytes?: true
    objectKey?: true
    checksum?: true
    createdAt?: true
    expiresAt?: true
  }

  export type AttachmentMaxAggregateInputType = {
    id?: true
    messageId?: true
    filename?: true
    contentType?: true
    sizeBytes?: true
    objectKey?: true
    checksum?: true
    createdAt?: true
    expiresAt?: true
  }

  export type AttachmentCountAggregateInputType = {
    id?: true
    messageId?: true
    filename?: true
    contentType?: true
    sizeBytes?: true
    objectKey?: true
    checksum?: true
    createdAt?: true
    expiresAt?: true
    _all?: true
  }

  export type AttachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attachment to aggregate.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attachments
    **/
    _count?: true | AttachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttachmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttachmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttachmentMaxAggregateInputType
  }

  export type GetAttachmentAggregateType<T extends AttachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAttachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttachment[P]>
      : GetScalarType<T[P], AggregateAttachment[P]>
  }




  export type AttachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttachmentWhereInput
    orderBy?: AttachmentOrderByWithAggregationInput | AttachmentOrderByWithAggregationInput[]
    by: AttachmentScalarFieldEnum[] | AttachmentScalarFieldEnum
    having?: AttachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttachmentCountAggregateInputType | true
    _avg?: AttachmentAvgAggregateInputType
    _sum?: AttachmentSumAggregateInputType
    _min?: AttachmentMinAggregateInputType
    _max?: AttachmentMaxAggregateInputType
  }

  export type AttachmentGroupByOutputType = {
    id: string
    messageId: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum: string | null
    createdAt: Date
    expiresAt: Date
    _count: AttachmentCountAggregateOutputType | null
    _avg: AttachmentAvgAggregateOutputType | null
    _sum: AttachmentSumAggregateOutputType | null
    _min: AttachmentMinAggregateOutputType | null
    _max: AttachmentMaxAggregateOutputType | null
  }

  type GetAttachmentGroupByPayload<T extends AttachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttachmentGroupByOutputType[P]>
            : GetScalarType<T[P], AttachmentGroupByOutputType[P]>
        }
      >
    >


  export type AttachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    messageId?: boolean
    filename?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    objectKey?: boolean
    checksum?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    message?: boolean | MessageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    messageId?: boolean
    filename?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    objectKey?: boolean
    checksum?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    message?: boolean | MessageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    messageId?: boolean
    filename?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    objectKey?: boolean
    checksum?: boolean
    createdAt?: boolean
    expiresAt?: boolean
    message?: boolean | MessageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attachment"]>

  export type AttachmentSelectScalar = {
    id?: boolean
    messageId?: boolean
    filename?: boolean
    contentType?: boolean
    sizeBytes?: boolean
    objectKey?: boolean
    checksum?: boolean
    createdAt?: boolean
    expiresAt?: boolean
  }

  export type AttachmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "messageId" | "filename" | "contentType" | "sizeBytes" | "objectKey" | "checksum" | "createdAt" | "expiresAt", ExtArgs["result"]["attachment"]>
  export type AttachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    message?: boolean | MessageDefaultArgs<ExtArgs>
  }
  export type AttachmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    message?: boolean | MessageDefaultArgs<ExtArgs>
  }
  export type AttachmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    message?: boolean | MessageDefaultArgs<ExtArgs>
  }

  export type $AttachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attachment"
    objects: {
      message: Prisma.$MessagePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      messageId: string
      filename: string
      contentType: string
      sizeBytes: number
      objectKey: string
      checksum: string | null
      createdAt: Date
      expiresAt: Date
    }, ExtArgs["result"]["attachment"]>
    composites: {}
  }

  type AttachmentGetPayload<S extends boolean | null | undefined | AttachmentDefaultArgs> = $Result.GetResult<Prisma.$AttachmentPayload, S>

  type AttachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttachmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttachmentCountAggregateInputType | true
    }

  export interface AttachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attachment'], meta: { name: 'Attachment' } }
    /**
     * Find zero or one Attachment that matches the filter.
     * @param {AttachmentFindUniqueArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttachmentFindUniqueArgs>(args: SelectSubset<T, AttachmentFindUniqueArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attachment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttachmentFindUniqueOrThrowArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, AttachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindFirstArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttachmentFindFirstArgs>(args?: SelectSubset<T, AttachmentFindFirstArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindFirstOrThrowArgs} args - Arguments to find a Attachment
     * @example
     * // Get one Attachment
     * const attachment = await prisma.attachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, AttachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attachments
     * const attachments = await prisma.attachment.findMany()
     * 
     * // Get first 10 Attachments
     * const attachments = await prisma.attachment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attachmentWithIdOnly = await prisma.attachment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttachmentFindManyArgs>(args?: SelectSubset<T, AttachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attachment.
     * @param {AttachmentCreateArgs} args - Arguments to create a Attachment.
     * @example
     * // Create one Attachment
     * const Attachment = await prisma.attachment.create({
     *   data: {
     *     // ... data to create a Attachment
     *   }
     * })
     * 
     */
    create<T extends AttachmentCreateArgs>(args: SelectSubset<T, AttachmentCreateArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attachments.
     * @param {AttachmentCreateManyArgs} args - Arguments to create many Attachments.
     * @example
     * // Create many Attachments
     * const attachment = await prisma.attachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttachmentCreateManyArgs>(args?: SelectSubset<T, AttachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attachments and returns the data saved in the database.
     * @param {AttachmentCreateManyAndReturnArgs} args - Arguments to create many Attachments.
     * @example
     * // Create many Attachments
     * const attachment = await prisma.attachment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attachments and only return the `id`
     * const attachmentWithIdOnly = await prisma.attachment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttachmentCreateManyAndReturnArgs>(args?: SelectSubset<T, AttachmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Attachment.
     * @param {AttachmentDeleteArgs} args - Arguments to delete one Attachment.
     * @example
     * // Delete one Attachment
     * const Attachment = await prisma.attachment.delete({
     *   where: {
     *     // ... filter to delete one Attachment
     *   }
     * })
     * 
     */
    delete<T extends AttachmentDeleteArgs>(args: SelectSubset<T, AttachmentDeleteArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attachment.
     * @param {AttachmentUpdateArgs} args - Arguments to update one Attachment.
     * @example
     * // Update one Attachment
     * const attachment = await prisma.attachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttachmentUpdateArgs>(args: SelectSubset<T, AttachmentUpdateArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attachments.
     * @param {AttachmentDeleteManyArgs} args - Arguments to filter Attachments to delete.
     * @example
     * // Delete a few Attachments
     * const { count } = await prisma.attachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttachmentDeleteManyArgs>(args?: SelectSubset<T, AttachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attachments
     * const attachment = await prisma.attachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttachmentUpdateManyArgs>(args: SelectSubset<T, AttachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attachments and returns the data updated in the database.
     * @param {AttachmentUpdateManyAndReturnArgs} args - Arguments to update many Attachments.
     * @example
     * // Update many Attachments
     * const attachment = await prisma.attachment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Attachments and only return the `id`
     * const attachmentWithIdOnly = await prisma.attachment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AttachmentUpdateManyAndReturnArgs>(args: SelectSubset<T, AttachmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Attachment.
     * @param {AttachmentUpsertArgs} args - Arguments to update or create a Attachment.
     * @example
     * // Update or create a Attachment
     * const attachment = await prisma.attachment.upsert({
     *   create: {
     *     // ... data to create a Attachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attachment we want to update
     *   }
     * })
     */
    upsert<T extends AttachmentUpsertArgs>(args: SelectSubset<T, AttachmentUpsertArgs<ExtArgs>>): Prisma__AttachmentClient<$Result.GetResult<Prisma.$AttachmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentCountArgs} args - Arguments to filter Attachments to count.
     * @example
     * // Count the number of Attachments
     * const count = await prisma.attachment.count({
     *   where: {
     *     // ... the filter for the Attachments we want to count
     *   }
     * })
    **/
    count<T extends AttachmentCountArgs>(
      args?: Subset<T, AttachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttachmentAggregateArgs>(args: Subset<T, AttachmentAggregateArgs>): Prisma.PrismaPromise<GetAttachmentAggregateType<T>>

    /**
     * Group by Attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttachmentGroupByArgs['orderBy'] }
        : { orderBy?: AttachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attachment model
   */
  readonly fields: AttachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    message<T extends MessageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MessageDefaultArgs<ExtArgs>>): Prisma__MessageClient<$Result.GetResult<Prisma.$MessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attachment model
   */
  interface AttachmentFieldRefs {
    readonly id: FieldRef<"Attachment", 'String'>
    readonly messageId: FieldRef<"Attachment", 'String'>
    readonly filename: FieldRef<"Attachment", 'String'>
    readonly contentType: FieldRef<"Attachment", 'String'>
    readonly sizeBytes: FieldRef<"Attachment", 'Int'>
    readonly objectKey: FieldRef<"Attachment", 'String'>
    readonly checksum: FieldRef<"Attachment", 'String'>
    readonly createdAt: FieldRef<"Attachment", 'DateTime'>
    readonly expiresAt: FieldRef<"Attachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attachment findUnique
   */
  export type AttachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment findUniqueOrThrow
   */
  export type AttachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment findFirst
   */
  export type AttachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment findFirstOrThrow
   */
  export type AttachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachment to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment findMany
   */
  export type AttachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter, which Attachments to fetch.
     */
    where?: AttachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attachments to fetch.
     */
    orderBy?: AttachmentOrderByWithRelationInput | AttachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attachments.
     */
    cursor?: AttachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attachments.
     */
    distinct?: AttachmentScalarFieldEnum | AttachmentScalarFieldEnum[]
  }

  /**
   * Attachment create
   */
  export type AttachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a Attachment.
     */
    data: XOR<AttachmentCreateInput, AttachmentUncheckedCreateInput>
  }

  /**
   * Attachment createMany
   */
  export type AttachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attachments.
     */
    data: AttachmentCreateManyInput | AttachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attachment createManyAndReturn
   */
  export type AttachmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * The data used to create many Attachments.
     */
    data: AttachmentCreateManyInput | AttachmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attachment update
   */
  export type AttachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a Attachment.
     */
    data: XOR<AttachmentUpdateInput, AttachmentUncheckedUpdateInput>
    /**
     * Choose, which Attachment to update.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment updateMany
   */
  export type AttachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attachments.
     */
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyInput>
    /**
     * Filter which Attachments to update
     */
    where?: AttachmentWhereInput
    /**
     * Limit how many Attachments to update.
     */
    limit?: number
  }

  /**
   * Attachment updateManyAndReturn
   */
  export type AttachmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * The data used to update Attachments.
     */
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyInput>
    /**
     * Filter which Attachments to update
     */
    where?: AttachmentWhereInput
    /**
     * Limit how many Attachments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attachment upsert
   */
  export type AttachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the Attachment to update in case it exists.
     */
    where: AttachmentWhereUniqueInput
    /**
     * In case the Attachment found by the `where` argument doesn't exist, create a new Attachment with this data.
     */
    create: XOR<AttachmentCreateInput, AttachmentUncheckedCreateInput>
    /**
     * In case the Attachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttachmentUpdateInput, AttachmentUncheckedUpdateInput>
  }

  /**
   * Attachment delete
   */
  export type AttachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
    /**
     * Filter which Attachment to delete.
     */
    where: AttachmentWhereUniqueInput
  }

  /**
   * Attachment deleteMany
   */
  export type AttachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attachments to delete
     */
    where?: AttachmentWhereInput
    /**
     * Limit how many Attachments to delete.
     */
    limit?: number
  }

  /**
   * Attachment without action
   */
  export type AttachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attachment
     */
    select?: AttachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attachment
     */
    omit?: AttachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttachmentInclude<ExtArgs> | null
  }


  /**
   * Model IngestLog
   */

  export type AggregateIngestLog = {
    _count: IngestLogCountAggregateOutputType | null
    _avg: IngestLogAvgAggregateOutputType | null
    _sum: IngestLogSumAggregateOutputType | null
    _min: IngestLogMinAggregateOutputType | null
    _max: IngestLogMaxAggregateOutputType | null
  }

  export type IngestLogAvgAggregateOutputType = {
    sizeBytes: number | null
  }

  export type IngestLogSumAggregateOutputType = {
    sizeBytes: number | null
  }

  export type IngestLogMinAggregateOutputType = {
    id: string | null
    recipient: string | null
    accepted: boolean | null
    rejectReason: string | null
    rawObjectKey: string | null
    sizeBytes: number | null
    createdAt: Date | null
  }

  export type IngestLogMaxAggregateOutputType = {
    id: string | null
    recipient: string | null
    accepted: boolean | null
    rejectReason: string | null
    rawObjectKey: string | null
    sizeBytes: number | null
    createdAt: Date | null
  }

  export type IngestLogCountAggregateOutputType = {
    id: number
    recipient: number
    accepted: number
    rejectReason: number
    rawObjectKey: number
    sizeBytes: number
    createdAt: number
    _all: number
  }


  export type IngestLogAvgAggregateInputType = {
    sizeBytes?: true
  }

  export type IngestLogSumAggregateInputType = {
    sizeBytes?: true
  }

  export type IngestLogMinAggregateInputType = {
    id?: true
    recipient?: true
    accepted?: true
    rejectReason?: true
    rawObjectKey?: true
    sizeBytes?: true
    createdAt?: true
  }

  export type IngestLogMaxAggregateInputType = {
    id?: true
    recipient?: true
    accepted?: true
    rejectReason?: true
    rawObjectKey?: true
    sizeBytes?: true
    createdAt?: true
  }

  export type IngestLogCountAggregateInputType = {
    id?: true
    recipient?: true
    accepted?: true
    rejectReason?: true
    rawObjectKey?: true
    sizeBytes?: true
    createdAt?: true
    _all?: true
  }

  export type IngestLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IngestLog to aggregate.
     */
    where?: IngestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngestLogs to fetch.
     */
    orderBy?: IngestLogOrderByWithRelationInput | IngestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IngestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IngestLogs
    **/
    _count?: true | IngestLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IngestLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IngestLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IngestLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IngestLogMaxAggregateInputType
  }

  export type GetIngestLogAggregateType<T extends IngestLogAggregateArgs> = {
        [P in keyof T & keyof AggregateIngestLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngestLog[P]>
      : GetScalarType<T[P], AggregateIngestLog[P]>
  }




  export type IngestLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IngestLogWhereInput
    orderBy?: IngestLogOrderByWithAggregationInput | IngestLogOrderByWithAggregationInput[]
    by: IngestLogScalarFieldEnum[] | IngestLogScalarFieldEnum
    having?: IngestLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IngestLogCountAggregateInputType | true
    _avg?: IngestLogAvgAggregateInputType
    _sum?: IngestLogSumAggregateInputType
    _min?: IngestLogMinAggregateInputType
    _max?: IngestLogMaxAggregateInputType
  }

  export type IngestLogGroupByOutputType = {
    id: string
    recipient: string
    accepted: boolean
    rejectReason: string | null
    rawObjectKey: string | null
    sizeBytes: number | null
    createdAt: Date
    _count: IngestLogCountAggregateOutputType | null
    _avg: IngestLogAvgAggregateOutputType | null
    _sum: IngestLogSumAggregateOutputType | null
    _min: IngestLogMinAggregateOutputType | null
    _max: IngestLogMaxAggregateOutputType | null
  }

  type GetIngestLogGroupByPayload<T extends IngestLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IngestLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IngestLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IngestLogGroupByOutputType[P]>
            : GetScalarType<T[P], IngestLogGroupByOutputType[P]>
        }
      >
    >


  export type IngestLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recipient?: boolean
    accepted?: boolean
    rejectReason?: boolean
    rawObjectKey?: boolean
    sizeBytes?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ingestLog"]>

  export type IngestLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recipient?: boolean
    accepted?: boolean
    rejectReason?: boolean
    rawObjectKey?: boolean
    sizeBytes?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ingestLog"]>

  export type IngestLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recipient?: boolean
    accepted?: boolean
    rejectReason?: boolean
    rawObjectKey?: boolean
    sizeBytes?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["ingestLog"]>

  export type IngestLogSelectScalar = {
    id?: boolean
    recipient?: boolean
    accepted?: boolean
    rejectReason?: boolean
    rawObjectKey?: boolean
    sizeBytes?: boolean
    createdAt?: boolean
  }

  export type IngestLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "recipient" | "accepted" | "rejectReason" | "rawObjectKey" | "sizeBytes" | "createdAt", ExtArgs["result"]["ingestLog"]>

  export type $IngestLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IngestLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      recipient: string
      accepted: boolean
      rejectReason: string | null
      rawObjectKey: string | null
      sizeBytes: number | null
      createdAt: Date
    }, ExtArgs["result"]["ingestLog"]>
    composites: {}
  }

  type IngestLogGetPayload<S extends boolean | null | undefined | IngestLogDefaultArgs> = $Result.GetResult<Prisma.$IngestLogPayload, S>

  type IngestLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IngestLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IngestLogCountAggregateInputType | true
    }

  export interface IngestLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IngestLog'], meta: { name: 'IngestLog' } }
    /**
     * Find zero or one IngestLog that matches the filter.
     * @param {IngestLogFindUniqueArgs} args - Arguments to find a IngestLog
     * @example
     * // Get one IngestLog
     * const ingestLog = await prisma.ingestLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IngestLogFindUniqueArgs>(args: SelectSubset<T, IngestLogFindUniqueArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IngestLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IngestLogFindUniqueOrThrowArgs} args - Arguments to find a IngestLog
     * @example
     * // Get one IngestLog
     * const ingestLog = await prisma.ingestLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IngestLogFindUniqueOrThrowArgs>(args: SelectSubset<T, IngestLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IngestLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogFindFirstArgs} args - Arguments to find a IngestLog
     * @example
     * // Get one IngestLog
     * const ingestLog = await prisma.ingestLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IngestLogFindFirstArgs>(args?: SelectSubset<T, IngestLogFindFirstArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IngestLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogFindFirstOrThrowArgs} args - Arguments to find a IngestLog
     * @example
     * // Get one IngestLog
     * const ingestLog = await prisma.ingestLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IngestLogFindFirstOrThrowArgs>(args?: SelectSubset<T, IngestLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IngestLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IngestLogs
     * const ingestLogs = await prisma.ingestLog.findMany()
     * 
     * // Get first 10 IngestLogs
     * const ingestLogs = await prisma.ingestLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ingestLogWithIdOnly = await prisma.ingestLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IngestLogFindManyArgs>(args?: SelectSubset<T, IngestLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IngestLog.
     * @param {IngestLogCreateArgs} args - Arguments to create a IngestLog.
     * @example
     * // Create one IngestLog
     * const IngestLog = await prisma.ingestLog.create({
     *   data: {
     *     // ... data to create a IngestLog
     *   }
     * })
     * 
     */
    create<T extends IngestLogCreateArgs>(args: SelectSubset<T, IngestLogCreateArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IngestLogs.
     * @param {IngestLogCreateManyArgs} args - Arguments to create many IngestLogs.
     * @example
     * // Create many IngestLogs
     * const ingestLog = await prisma.ingestLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IngestLogCreateManyArgs>(args?: SelectSubset<T, IngestLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IngestLogs and returns the data saved in the database.
     * @param {IngestLogCreateManyAndReturnArgs} args - Arguments to create many IngestLogs.
     * @example
     * // Create many IngestLogs
     * const ingestLog = await prisma.ingestLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IngestLogs and only return the `id`
     * const ingestLogWithIdOnly = await prisma.ingestLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IngestLogCreateManyAndReturnArgs>(args?: SelectSubset<T, IngestLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IngestLog.
     * @param {IngestLogDeleteArgs} args - Arguments to delete one IngestLog.
     * @example
     * // Delete one IngestLog
     * const IngestLog = await prisma.ingestLog.delete({
     *   where: {
     *     // ... filter to delete one IngestLog
     *   }
     * })
     * 
     */
    delete<T extends IngestLogDeleteArgs>(args: SelectSubset<T, IngestLogDeleteArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IngestLog.
     * @param {IngestLogUpdateArgs} args - Arguments to update one IngestLog.
     * @example
     * // Update one IngestLog
     * const ingestLog = await prisma.ingestLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IngestLogUpdateArgs>(args: SelectSubset<T, IngestLogUpdateArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IngestLogs.
     * @param {IngestLogDeleteManyArgs} args - Arguments to filter IngestLogs to delete.
     * @example
     * // Delete a few IngestLogs
     * const { count } = await prisma.ingestLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IngestLogDeleteManyArgs>(args?: SelectSubset<T, IngestLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IngestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IngestLogs
     * const ingestLog = await prisma.ingestLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IngestLogUpdateManyArgs>(args: SelectSubset<T, IngestLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IngestLogs and returns the data updated in the database.
     * @param {IngestLogUpdateManyAndReturnArgs} args - Arguments to update many IngestLogs.
     * @example
     * // Update many IngestLogs
     * const ingestLog = await prisma.ingestLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IngestLogs and only return the `id`
     * const ingestLogWithIdOnly = await prisma.ingestLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IngestLogUpdateManyAndReturnArgs>(args: SelectSubset<T, IngestLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IngestLog.
     * @param {IngestLogUpsertArgs} args - Arguments to update or create a IngestLog.
     * @example
     * // Update or create a IngestLog
     * const ingestLog = await prisma.ingestLog.upsert({
     *   create: {
     *     // ... data to create a IngestLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IngestLog we want to update
     *   }
     * })
     */
    upsert<T extends IngestLogUpsertArgs>(args: SelectSubset<T, IngestLogUpsertArgs<ExtArgs>>): Prisma__IngestLogClient<$Result.GetResult<Prisma.$IngestLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IngestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogCountArgs} args - Arguments to filter IngestLogs to count.
     * @example
     * // Count the number of IngestLogs
     * const count = await prisma.ingestLog.count({
     *   where: {
     *     // ... the filter for the IngestLogs we want to count
     *   }
     * })
    **/
    count<T extends IngestLogCountArgs>(
      args?: Subset<T, IngestLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IngestLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IngestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IngestLogAggregateArgs>(args: Subset<T, IngestLogAggregateArgs>): Prisma.PrismaPromise<GetIngestLogAggregateType<T>>

    /**
     * Group by IngestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngestLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IngestLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IngestLogGroupByArgs['orderBy'] }
        : { orderBy?: IngestLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IngestLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngestLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IngestLog model
   */
  readonly fields: IngestLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IngestLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IngestLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IngestLog model
   */
  interface IngestLogFieldRefs {
    readonly id: FieldRef<"IngestLog", 'String'>
    readonly recipient: FieldRef<"IngestLog", 'String'>
    readonly accepted: FieldRef<"IngestLog", 'Boolean'>
    readonly rejectReason: FieldRef<"IngestLog", 'String'>
    readonly rawObjectKey: FieldRef<"IngestLog", 'String'>
    readonly sizeBytes: FieldRef<"IngestLog", 'Int'>
    readonly createdAt: FieldRef<"IngestLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IngestLog findUnique
   */
  export type IngestLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * Filter, which IngestLog to fetch.
     */
    where: IngestLogWhereUniqueInput
  }

  /**
   * IngestLog findUniqueOrThrow
   */
  export type IngestLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * Filter, which IngestLog to fetch.
     */
    where: IngestLogWhereUniqueInput
  }

  /**
   * IngestLog findFirst
   */
  export type IngestLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * Filter, which IngestLog to fetch.
     */
    where?: IngestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngestLogs to fetch.
     */
    orderBy?: IngestLogOrderByWithRelationInput | IngestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IngestLogs.
     */
    cursor?: IngestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IngestLogs.
     */
    distinct?: IngestLogScalarFieldEnum | IngestLogScalarFieldEnum[]
  }

  /**
   * IngestLog findFirstOrThrow
   */
  export type IngestLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * Filter, which IngestLog to fetch.
     */
    where?: IngestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngestLogs to fetch.
     */
    orderBy?: IngestLogOrderByWithRelationInput | IngestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IngestLogs.
     */
    cursor?: IngestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IngestLogs.
     */
    distinct?: IngestLogScalarFieldEnum | IngestLogScalarFieldEnum[]
  }

  /**
   * IngestLog findMany
   */
  export type IngestLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * Filter, which IngestLogs to fetch.
     */
    where?: IngestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngestLogs to fetch.
     */
    orderBy?: IngestLogOrderByWithRelationInput | IngestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IngestLogs.
     */
    cursor?: IngestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IngestLogs.
     */
    distinct?: IngestLogScalarFieldEnum | IngestLogScalarFieldEnum[]
  }

  /**
   * IngestLog create
   */
  export type IngestLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * The data needed to create a IngestLog.
     */
    data: XOR<IngestLogCreateInput, IngestLogUncheckedCreateInput>
  }

  /**
   * IngestLog createMany
   */
  export type IngestLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IngestLogs.
     */
    data: IngestLogCreateManyInput | IngestLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IngestLog createManyAndReturn
   */
  export type IngestLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * The data used to create many IngestLogs.
     */
    data: IngestLogCreateManyInput | IngestLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IngestLog update
   */
  export type IngestLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * The data needed to update a IngestLog.
     */
    data: XOR<IngestLogUpdateInput, IngestLogUncheckedUpdateInput>
    /**
     * Choose, which IngestLog to update.
     */
    where: IngestLogWhereUniqueInput
  }

  /**
   * IngestLog updateMany
   */
  export type IngestLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IngestLogs.
     */
    data: XOR<IngestLogUpdateManyMutationInput, IngestLogUncheckedUpdateManyInput>
    /**
     * Filter which IngestLogs to update
     */
    where?: IngestLogWhereInput
    /**
     * Limit how many IngestLogs to update.
     */
    limit?: number
  }

  /**
   * IngestLog updateManyAndReturn
   */
  export type IngestLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * The data used to update IngestLogs.
     */
    data: XOR<IngestLogUpdateManyMutationInput, IngestLogUncheckedUpdateManyInput>
    /**
     * Filter which IngestLogs to update
     */
    where?: IngestLogWhereInput
    /**
     * Limit how many IngestLogs to update.
     */
    limit?: number
  }

  /**
   * IngestLog upsert
   */
  export type IngestLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * The filter to search for the IngestLog to update in case it exists.
     */
    where: IngestLogWhereUniqueInput
    /**
     * In case the IngestLog found by the `where` argument doesn't exist, create a new IngestLog with this data.
     */
    create: XOR<IngestLogCreateInput, IngestLogUncheckedCreateInput>
    /**
     * In case the IngestLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IngestLogUpdateInput, IngestLogUncheckedUpdateInput>
  }

  /**
   * IngestLog delete
   */
  export type IngestLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
    /**
     * Filter which IngestLog to delete.
     */
    where: IngestLogWhereUniqueInput
  }

  /**
   * IngestLog deleteMany
   */
  export type IngestLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IngestLogs to delete
     */
    where?: IngestLogWhereInput
    /**
     * Limit how many IngestLogs to delete.
     */
    limit?: number
  }

  /**
   * IngestLog without action
   */
  export type IngestLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngestLog
     */
    select?: IngestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngestLog
     */
    omit?: IngestLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InboxScalarFieldEnum: {
    id: 'id',
    address: 'address',
    localPart: 'localPart',
    domain: 'domain',
    createdAt: 'createdAt',
    expiresAt: 'expiresAt',
    lastExtendedAt: 'lastExtendedAt',
    extendCount: 'extendCount',
    isDeleted: 'isDeleted',
    deletedAt: 'deletedAt',
    tokenHash: 'tokenHash'
  };

  export type InboxScalarFieldEnum = (typeof InboxScalarFieldEnum)[keyof typeof InboxScalarFieldEnum]


  export const MessageScalarFieldEnum: {
    id: 'id',
    inboxId: 'inboxId',
    fromAddress: 'fromAddress',
    fromName: 'fromName',
    toAddress: 'toAddress',
    subject: 'subject',
    textBody: 'textBody',
    htmlBody: 'htmlBody',
    rawObjectKey: 'rawObjectKey',
    rawSizeBytes: 'rawSizeBytes',
    sizeBytes: 'sizeBytes',
    status: 'status',
    receivedAt: 'receivedAt',
    parsedAt: 'parsedAt',
    expiresAt: 'expiresAt',
    errorMessage: 'errorMessage'
  };

  export type MessageScalarFieldEnum = (typeof MessageScalarFieldEnum)[keyof typeof MessageScalarFieldEnum]


  export const AttachmentScalarFieldEnum: {
    id: 'id',
    messageId: 'messageId',
    filename: 'filename',
    contentType: 'contentType',
    sizeBytes: 'sizeBytes',
    objectKey: 'objectKey',
    checksum: 'checksum',
    createdAt: 'createdAt',
    expiresAt: 'expiresAt'
  };

  export type AttachmentScalarFieldEnum = (typeof AttachmentScalarFieldEnum)[keyof typeof AttachmentScalarFieldEnum]


  export const IngestLogScalarFieldEnum: {
    id: 'id',
    recipient: 'recipient',
    accepted: 'accepted',
    rejectReason: 'rejectReason',
    rawObjectKey: 'rawObjectKey',
    sizeBytes: 'sizeBytes',
    createdAt: 'createdAt'
  };

  export type IngestLogScalarFieldEnum = (typeof IngestLogScalarFieldEnum)[keyof typeof IngestLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'MessageStatus'
   */
  export type EnumMessageStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageStatus'>
    


  /**
   * Reference to a field of type 'MessageStatus[]'
   */
  export type ListEnumMessageStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type InboxWhereInput = {
    AND?: InboxWhereInput | InboxWhereInput[]
    OR?: InboxWhereInput[]
    NOT?: InboxWhereInput | InboxWhereInput[]
    id?: StringFilter<"Inbox"> | string
    address?: StringFilter<"Inbox"> | string
    localPart?: StringFilter<"Inbox"> | string
    domain?: StringFilter<"Inbox"> | string
    createdAt?: DateTimeFilter<"Inbox"> | Date | string
    expiresAt?: DateTimeFilter<"Inbox"> | Date | string
    lastExtendedAt?: DateTimeNullableFilter<"Inbox"> | Date | string | null
    extendCount?: IntFilter<"Inbox"> | number
    isDeleted?: BoolFilter<"Inbox"> | boolean
    deletedAt?: DateTimeNullableFilter<"Inbox"> | Date | string | null
    tokenHash?: StringFilter<"Inbox"> | string
    messages?: MessageListRelationFilter
  }

  export type InboxOrderByWithRelationInput = {
    id?: SortOrder
    address?: SortOrder
    localPart?: SortOrder
    domain?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    lastExtendedAt?: SortOrderInput | SortOrder
    extendCount?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    tokenHash?: SortOrder
    messages?: MessageOrderByRelationAggregateInput
  }

  export type InboxWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    address?: string
    tokenHash?: string
    AND?: InboxWhereInput | InboxWhereInput[]
    OR?: InboxWhereInput[]
    NOT?: InboxWhereInput | InboxWhereInput[]
    localPart?: StringFilter<"Inbox"> | string
    domain?: StringFilter<"Inbox"> | string
    createdAt?: DateTimeFilter<"Inbox"> | Date | string
    expiresAt?: DateTimeFilter<"Inbox"> | Date | string
    lastExtendedAt?: DateTimeNullableFilter<"Inbox"> | Date | string | null
    extendCount?: IntFilter<"Inbox"> | number
    isDeleted?: BoolFilter<"Inbox"> | boolean
    deletedAt?: DateTimeNullableFilter<"Inbox"> | Date | string | null
    messages?: MessageListRelationFilter
  }, "id" | "address" | "tokenHash">

  export type InboxOrderByWithAggregationInput = {
    id?: SortOrder
    address?: SortOrder
    localPart?: SortOrder
    domain?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    lastExtendedAt?: SortOrderInput | SortOrder
    extendCount?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    tokenHash?: SortOrder
    _count?: InboxCountOrderByAggregateInput
    _avg?: InboxAvgOrderByAggregateInput
    _max?: InboxMaxOrderByAggregateInput
    _min?: InboxMinOrderByAggregateInput
    _sum?: InboxSumOrderByAggregateInput
  }

  export type InboxScalarWhereWithAggregatesInput = {
    AND?: InboxScalarWhereWithAggregatesInput | InboxScalarWhereWithAggregatesInput[]
    OR?: InboxScalarWhereWithAggregatesInput[]
    NOT?: InboxScalarWhereWithAggregatesInput | InboxScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Inbox"> | string
    address?: StringWithAggregatesFilter<"Inbox"> | string
    localPart?: StringWithAggregatesFilter<"Inbox"> | string
    domain?: StringWithAggregatesFilter<"Inbox"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Inbox"> | Date | string
    expiresAt?: DateTimeWithAggregatesFilter<"Inbox"> | Date | string
    lastExtendedAt?: DateTimeNullableWithAggregatesFilter<"Inbox"> | Date | string | null
    extendCount?: IntWithAggregatesFilter<"Inbox"> | number
    isDeleted?: BoolWithAggregatesFilter<"Inbox"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"Inbox"> | Date | string | null
    tokenHash?: StringWithAggregatesFilter<"Inbox"> | string
  }

  export type MessageWhereInput = {
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    id?: StringFilter<"Message"> | string
    inboxId?: StringFilter<"Message"> | string
    fromAddress?: StringFilter<"Message"> | string
    fromName?: StringNullableFilter<"Message"> | string | null
    toAddress?: StringFilter<"Message"> | string
    subject?: StringNullableFilter<"Message"> | string | null
    textBody?: StringNullableFilter<"Message"> | string | null
    htmlBody?: StringNullableFilter<"Message"> | string | null
    rawObjectKey?: StringNullableFilter<"Message"> | string | null
    rawSizeBytes?: IntNullableFilter<"Message"> | number | null
    sizeBytes?: IntFilter<"Message"> | number
    status?: EnumMessageStatusFilter<"Message"> | $Enums.MessageStatus
    receivedAt?: DateTimeFilter<"Message"> | Date | string
    parsedAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    expiresAt?: DateTimeFilter<"Message"> | Date | string
    errorMessage?: StringNullableFilter<"Message"> | string | null
    inbox?: XOR<InboxScalarRelationFilter, InboxWhereInput>
    attachments?: AttachmentListRelationFilter
  }

  export type MessageOrderByWithRelationInput = {
    id?: SortOrder
    inboxId?: SortOrder
    fromAddress?: SortOrder
    fromName?: SortOrderInput | SortOrder
    toAddress?: SortOrder
    subject?: SortOrderInput | SortOrder
    textBody?: SortOrderInput | SortOrder
    htmlBody?: SortOrderInput | SortOrder
    rawObjectKey?: SortOrderInput | SortOrder
    rawSizeBytes?: SortOrderInput | SortOrder
    sizeBytes?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    parsedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    inbox?: InboxOrderByWithRelationInput
    attachments?: AttachmentOrderByRelationAggregateInput
  }

  export type MessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MessageWhereInput | MessageWhereInput[]
    OR?: MessageWhereInput[]
    NOT?: MessageWhereInput | MessageWhereInput[]
    inboxId?: StringFilter<"Message"> | string
    fromAddress?: StringFilter<"Message"> | string
    fromName?: StringNullableFilter<"Message"> | string | null
    toAddress?: StringFilter<"Message"> | string
    subject?: StringNullableFilter<"Message"> | string | null
    textBody?: StringNullableFilter<"Message"> | string | null
    htmlBody?: StringNullableFilter<"Message"> | string | null
    rawObjectKey?: StringNullableFilter<"Message"> | string | null
    rawSizeBytes?: IntNullableFilter<"Message"> | number | null
    sizeBytes?: IntFilter<"Message"> | number
    status?: EnumMessageStatusFilter<"Message"> | $Enums.MessageStatus
    receivedAt?: DateTimeFilter<"Message"> | Date | string
    parsedAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    expiresAt?: DateTimeFilter<"Message"> | Date | string
    errorMessage?: StringNullableFilter<"Message"> | string | null
    inbox?: XOR<InboxScalarRelationFilter, InboxWhereInput>
    attachments?: AttachmentListRelationFilter
  }, "id">

  export type MessageOrderByWithAggregationInput = {
    id?: SortOrder
    inboxId?: SortOrder
    fromAddress?: SortOrder
    fromName?: SortOrderInput | SortOrder
    toAddress?: SortOrder
    subject?: SortOrderInput | SortOrder
    textBody?: SortOrderInput | SortOrder
    htmlBody?: SortOrderInput | SortOrder
    rawObjectKey?: SortOrderInput | SortOrder
    rawSizeBytes?: SortOrderInput | SortOrder
    sizeBytes?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    parsedAt?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    _count?: MessageCountOrderByAggregateInput
    _avg?: MessageAvgOrderByAggregateInput
    _max?: MessageMaxOrderByAggregateInput
    _min?: MessageMinOrderByAggregateInput
    _sum?: MessageSumOrderByAggregateInput
  }

  export type MessageScalarWhereWithAggregatesInput = {
    AND?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    OR?: MessageScalarWhereWithAggregatesInput[]
    NOT?: MessageScalarWhereWithAggregatesInput | MessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Message"> | string
    inboxId?: StringWithAggregatesFilter<"Message"> | string
    fromAddress?: StringWithAggregatesFilter<"Message"> | string
    fromName?: StringNullableWithAggregatesFilter<"Message"> | string | null
    toAddress?: StringWithAggregatesFilter<"Message"> | string
    subject?: StringNullableWithAggregatesFilter<"Message"> | string | null
    textBody?: StringNullableWithAggregatesFilter<"Message"> | string | null
    htmlBody?: StringNullableWithAggregatesFilter<"Message"> | string | null
    rawObjectKey?: StringNullableWithAggregatesFilter<"Message"> | string | null
    rawSizeBytes?: IntNullableWithAggregatesFilter<"Message"> | number | null
    sizeBytes?: IntWithAggregatesFilter<"Message"> | number
    status?: EnumMessageStatusWithAggregatesFilter<"Message"> | $Enums.MessageStatus
    receivedAt?: DateTimeWithAggregatesFilter<"Message"> | Date | string
    parsedAt?: DateTimeNullableWithAggregatesFilter<"Message"> | Date | string | null
    expiresAt?: DateTimeWithAggregatesFilter<"Message"> | Date | string
    errorMessage?: StringNullableWithAggregatesFilter<"Message"> | string | null
  }

  export type AttachmentWhereInput = {
    AND?: AttachmentWhereInput | AttachmentWhereInput[]
    OR?: AttachmentWhereInput[]
    NOT?: AttachmentWhereInput | AttachmentWhereInput[]
    id?: StringFilter<"Attachment"> | string
    messageId?: StringFilter<"Attachment"> | string
    filename?: StringFilter<"Attachment"> | string
    contentType?: StringFilter<"Attachment"> | string
    sizeBytes?: IntFilter<"Attachment"> | number
    objectKey?: StringFilter<"Attachment"> | string
    checksum?: StringNullableFilter<"Attachment"> | string | null
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    expiresAt?: DateTimeFilter<"Attachment"> | Date | string
    message?: XOR<MessageScalarRelationFilter, MessageWhereInput>
  }

  export type AttachmentOrderByWithRelationInput = {
    id?: SortOrder
    messageId?: SortOrder
    filename?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    objectKey?: SortOrder
    checksum?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    message?: MessageOrderByWithRelationInput
  }

  export type AttachmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AttachmentWhereInput | AttachmentWhereInput[]
    OR?: AttachmentWhereInput[]
    NOT?: AttachmentWhereInput | AttachmentWhereInput[]
    messageId?: StringFilter<"Attachment"> | string
    filename?: StringFilter<"Attachment"> | string
    contentType?: StringFilter<"Attachment"> | string
    sizeBytes?: IntFilter<"Attachment"> | number
    objectKey?: StringFilter<"Attachment"> | string
    checksum?: StringNullableFilter<"Attachment"> | string | null
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    expiresAt?: DateTimeFilter<"Attachment"> | Date | string
    message?: XOR<MessageScalarRelationFilter, MessageWhereInput>
  }, "id">

  export type AttachmentOrderByWithAggregationInput = {
    id?: SortOrder
    messageId?: SortOrder
    filename?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    objectKey?: SortOrder
    checksum?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    _count?: AttachmentCountOrderByAggregateInput
    _avg?: AttachmentAvgOrderByAggregateInput
    _max?: AttachmentMaxOrderByAggregateInput
    _min?: AttachmentMinOrderByAggregateInput
    _sum?: AttachmentSumOrderByAggregateInput
  }

  export type AttachmentScalarWhereWithAggregatesInput = {
    AND?: AttachmentScalarWhereWithAggregatesInput | AttachmentScalarWhereWithAggregatesInput[]
    OR?: AttachmentScalarWhereWithAggregatesInput[]
    NOT?: AttachmentScalarWhereWithAggregatesInput | AttachmentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attachment"> | string
    messageId?: StringWithAggregatesFilter<"Attachment"> | string
    filename?: StringWithAggregatesFilter<"Attachment"> | string
    contentType?: StringWithAggregatesFilter<"Attachment"> | string
    sizeBytes?: IntWithAggregatesFilter<"Attachment"> | number
    objectKey?: StringWithAggregatesFilter<"Attachment"> | string
    checksum?: StringNullableWithAggregatesFilter<"Attachment"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Attachment"> | Date | string
    expiresAt?: DateTimeWithAggregatesFilter<"Attachment"> | Date | string
  }

  export type IngestLogWhereInput = {
    AND?: IngestLogWhereInput | IngestLogWhereInput[]
    OR?: IngestLogWhereInput[]
    NOT?: IngestLogWhereInput | IngestLogWhereInput[]
    id?: StringFilter<"IngestLog"> | string
    recipient?: StringFilter<"IngestLog"> | string
    accepted?: BoolFilter<"IngestLog"> | boolean
    rejectReason?: StringNullableFilter<"IngestLog"> | string | null
    rawObjectKey?: StringNullableFilter<"IngestLog"> | string | null
    sizeBytes?: IntNullableFilter<"IngestLog"> | number | null
    createdAt?: DateTimeFilter<"IngestLog"> | Date | string
  }

  export type IngestLogOrderByWithRelationInput = {
    id?: SortOrder
    recipient?: SortOrder
    accepted?: SortOrder
    rejectReason?: SortOrderInput | SortOrder
    rawObjectKey?: SortOrderInput | SortOrder
    sizeBytes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type IngestLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IngestLogWhereInput | IngestLogWhereInput[]
    OR?: IngestLogWhereInput[]
    NOT?: IngestLogWhereInput | IngestLogWhereInput[]
    recipient?: StringFilter<"IngestLog"> | string
    accepted?: BoolFilter<"IngestLog"> | boolean
    rejectReason?: StringNullableFilter<"IngestLog"> | string | null
    rawObjectKey?: StringNullableFilter<"IngestLog"> | string | null
    sizeBytes?: IntNullableFilter<"IngestLog"> | number | null
    createdAt?: DateTimeFilter<"IngestLog"> | Date | string
  }, "id">

  export type IngestLogOrderByWithAggregationInput = {
    id?: SortOrder
    recipient?: SortOrder
    accepted?: SortOrder
    rejectReason?: SortOrderInput | SortOrder
    rawObjectKey?: SortOrderInput | SortOrder
    sizeBytes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: IngestLogCountOrderByAggregateInput
    _avg?: IngestLogAvgOrderByAggregateInput
    _max?: IngestLogMaxOrderByAggregateInput
    _min?: IngestLogMinOrderByAggregateInput
    _sum?: IngestLogSumOrderByAggregateInput
  }

  export type IngestLogScalarWhereWithAggregatesInput = {
    AND?: IngestLogScalarWhereWithAggregatesInput | IngestLogScalarWhereWithAggregatesInput[]
    OR?: IngestLogScalarWhereWithAggregatesInput[]
    NOT?: IngestLogScalarWhereWithAggregatesInput | IngestLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IngestLog"> | string
    recipient?: StringWithAggregatesFilter<"IngestLog"> | string
    accepted?: BoolWithAggregatesFilter<"IngestLog"> | boolean
    rejectReason?: StringNullableWithAggregatesFilter<"IngestLog"> | string | null
    rawObjectKey?: StringNullableWithAggregatesFilter<"IngestLog"> | string | null
    sizeBytes?: IntNullableWithAggregatesFilter<"IngestLog"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"IngestLog"> | Date | string
  }

  export type InboxCreateInput = {
    id?: string
    address: string
    localPart: string
    domain: string
    createdAt?: Date | string
    expiresAt: Date | string
    lastExtendedAt?: Date | string | null
    extendCount?: number
    isDeleted?: boolean
    deletedAt?: Date | string | null
    tokenHash: string
    messages?: MessageCreateNestedManyWithoutInboxInput
  }

  export type InboxUncheckedCreateInput = {
    id?: string
    address: string
    localPart: string
    domain: string
    createdAt?: Date | string
    expiresAt: Date | string
    lastExtendedAt?: Date | string | null
    extendCount?: number
    isDeleted?: boolean
    deletedAt?: Date | string | null
    tokenHash: string
    messages?: MessageUncheckedCreateNestedManyWithoutInboxInput
  }

  export type InboxUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    localPart?: StringFieldUpdateOperationsInput | string
    domain?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastExtendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    extendCount?: IntFieldUpdateOperationsInput | number
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    messages?: MessageUpdateManyWithoutInboxNestedInput
  }

  export type InboxUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    localPart?: StringFieldUpdateOperationsInput | string
    domain?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastExtendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    extendCount?: IntFieldUpdateOperationsInput | number
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
    messages?: MessageUncheckedUpdateManyWithoutInboxNestedInput
  }

  export type InboxCreateManyInput = {
    id?: string
    address: string
    localPart: string
    domain: string
    createdAt?: Date | string
    expiresAt: Date | string
    lastExtendedAt?: Date | string | null
    extendCount?: number
    isDeleted?: boolean
    deletedAt?: Date | string | null
    tokenHash: string
  }

  export type InboxUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    localPart?: StringFieldUpdateOperationsInput | string
    domain?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastExtendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    extendCount?: IntFieldUpdateOperationsInput | number
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
  }

  export type InboxUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    localPart?: StringFieldUpdateOperationsInput | string
    domain?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastExtendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    extendCount?: IntFieldUpdateOperationsInput | number
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
  }

  export type MessageCreateInput = {
    id?: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
    inbox: InboxCreateNestedOneWithoutMessagesInput
    attachments?: AttachmentCreateNestedManyWithoutMessageInput
  }

  export type MessageUncheckedCreateInput = {
    id?: string
    inboxId: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMessageInput
  }

  export type MessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    inbox?: InboxUpdateOneRequiredWithoutMessagesNestedInput
    attachments?: AttachmentUpdateManyWithoutMessageNestedInput
  }

  export type MessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    inboxId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMessageNestedInput
  }

  export type MessageCreateManyInput = {
    id?: string
    inboxId: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
  }

  export type MessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    inboxId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AttachmentCreateInput = {
    id?: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum?: string | null
    createdAt?: Date | string
    expiresAt: Date | string
    message: MessageCreateNestedOneWithoutAttachmentsInput
  }

  export type AttachmentUncheckedCreateInput = {
    id?: string
    messageId: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum?: string | null
    createdAt?: Date | string
    expiresAt: Date | string
  }

  export type AttachmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    message?: MessageUpdateOneRequiredWithoutAttachmentsNestedInput
  }

  export type AttachmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    messageId?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentCreateManyInput = {
    id?: string
    messageId: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum?: string | null
    createdAt?: Date | string
    expiresAt: Date | string
  }

  export type AttachmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    messageId?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngestLogCreateInput = {
    id?: string
    recipient: string
    accepted: boolean
    rejectReason?: string | null
    rawObjectKey?: string | null
    sizeBytes?: number | null
    createdAt?: Date | string
  }

  export type IngestLogUncheckedCreateInput = {
    id?: string
    recipient: string
    accepted: boolean
    rejectReason?: string | null
    rawObjectKey?: string | null
    sizeBytes?: number | null
    createdAt?: Date | string
  }

  export type IngestLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    accepted?: BoolFieldUpdateOperationsInput | boolean
    rejectReason?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    sizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngestLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    accepted?: BoolFieldUpdateOperationsInput | boolean
    rejectReason?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    sizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngestLogCreateManyInput = {
    id?: string
    recipient: string
    accepted: boolean
    rejectReason?: string | null
    rawObjectKey?: string | null
    sizeBytes?: number | null
    createdAt?: Date | string
  }

  export type IngestLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    accepted?: BoolFieldUpdateOperationsInput | boolean
    rejectReason?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    sizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngestLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    accepted?: BoolFieldUpdateOperationsInput | boolean
    rejectReason?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    sizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type MessageListRelationFilter = {
    every?: MessageWhereInput
    some?: MessageWhereInput
    none?: MessageWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InboxCountOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    localPart?: SortOrder
    domain?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    lastExtendedAt?: SortOrder
    extendCount?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    tokenHash?: SortOrder
  }

  export type InboxAvgOrderByAggregateInput = {
    extendCount?: SortOrder
  }

  export type InboxMaxOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    localPart?: SortOrder
    domain?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    lastExtendedAt?: SortOrder
    extendCount?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    tokenHash?: SortOrder
  }

  export type InboxMinOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    localPart?: SortOrder
    domain?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
    lastExtendedAt?: SortOrder
    extendCount?: SortOrder
    isDeleted?: SortOrder
    deletedAt?: SortOrder
    tokenHash?: SortOrder
  }

  export type InboxSumOrderByAggregateInput = {
    extendCount?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumMessageStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusFilter<$PrismaModel> | $Enums.MessageStatus
  }

  export type InboxScalarRelationFilter = {
    is?: InboxWhereInput
    isNot?: InboxWhereInput
  }

  export type AttachmentListRelationFilter = {
    every?: AttachmentWhereInput
    some?: AttachmentWhereInput
    none?: AttachmentWhereInput
  }

  export type AttachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MessageCountOrderByAggregateInput = {
    id?: SortOrder
    inboxId?: SortOrder
    fromAddress?: SortOrder
    fromName?: SortOrder
    toAddress?: SortOrder
    subject?: SortOrder
    textBody?: SortOrder
    htmlBody?: SortOrder
    rawObjectKey?: SortOrder
    rawSizeBytes?: SortOrder
    sizeBytes?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    parsedAt?: SortOrder
    expiresAt?: SortOrder
    errorMessage?: SortOrder
  }

  export type MessageAvgOrderByAggregateInput = {
    rawSizeBytes?: SortOrder
    sizeBytes?: SortOrder
  }

  export type MessageMaxOrderByAggregateInput = {
    id?: SortOrder
    inboxId?: SortOrder
    fromAddress?: SortOrder
    fromName?: SortOrder
    toAddress?: SortOrder
    subject?: SortOrder
    textBody?: SortOrder
    htmlBody?: SortOrder
    rawObjectKey?: SortOrder
    rawSizeBytes?: SortOrder
    sizeBytes?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    parsedAt?: SortOrder
    expiresAt?: SortOrder
    errorMessage?: SortOrder
  }

  export type MessageMinOrderByAggregateInput = {
    id?: SortOrder
    inboxId?: SortOrder
    fromAddress?: SortOrder
    fromName?: SortOrder
    toAddress?: SortOrder
    subject?: SortOrder
    textBody?: SortOrder
    htmlBody?: SortOrder
    rawObjectKey?: SortOrder
    rawSizeBytes?: SortOrder
    sizeBytes?: SortOrder
    status?: SortOrder
    receivedAt?: SortOrder
    parsedAt?: SortOrder
    expiresAt?: SortOrder
    errorMessage?: SortOrder
  }

  export type MessageSumOrderByAggregateInput = {
    rawSizeBytes?: SortOrder
    sizeBytes?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumMessageStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusWithAggregatesFilter<$PrismaModel> | $Enums.MessageStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageStatusFilter<$PrismaModel>
    _max?: NestedEnumMessageStatusFilter<$PrismaModel>
  }

  export type MessageScalarRelationFilter = {
    is?: MessageWhereInput
    isNot?: MessageWhereInput
  }

  export type AttachmentCountOrderByAggregateInput = {
    id?: SortOrder
    messageId?: SortOrder
    filename?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    objectKey?: SortOrder
    checksum?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type AttachmentAvgOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type AttachmentMaxOrderByAggregateInput = {
    id?: SortOrder
    messageId?: SortOrder
    filename?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    objectKey?: SortOrder
    checksum?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type AttachmentMinOrderByAggregateInput = {
    id?: SortOrder
    messageId?: SortOrder
    filename?: SortOrder
    contentType?: SortOrder
    sizeBytes?: SortOrder
    objectKey?: SortOrder
    checksum?: SortOrder
    createdAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type AttachmentSumOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type IngestLogCountOrderByAggregateInput = {
    id?: SortOrder
    recipient?: SortOrder
    accepted?: SortOrder
    rejectReason?: SortOrder
    rawObjectKey?: SortOrder
    sizeBytes?: SortOrder
    createdAt?: SortOrder
  }

  export type IngestLogAvgOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type IngestLogMaxOrderByAggregateInput = {
    id?: SortOrder
    recipient?: SortOrder
    accepted?: SortOrder
    rejectReason?: SortOrder
    rawObjectKey?: SortOrder
    sizeBytes?: SortOrder
    createdAt?: SortOrder
  }

  export type IngestLogMinOrderByAggregateInput = {
    id?: SortOrder
    recipient?: SortOrder
    accepted?: SortOrder
    rejectReason?: SortOrder
    rawObjectKey?: SortOrder
    sizeBytes?: SortOrder
    createdAt?: SortOrder
  }

  export type IngestLogSumOrderByAggregateInput = {
    sizeBytes?: SortOrder
  }

  export type MessageCreateNestedManyWithoutInboxInput = {
    create?: XOR<MessageCreateWithoutInboxInput, MessageUncheckedCreateWithoutInboxInput> | MessageCreateWithoutInboxInput[] | MessageUncheckedCreateWithoutInboxInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutInboxInput | MessageCreateOrConnectWithoutInboxInput[]
    createMany?: MessageCreateManyInboxInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type MessageUncheckedCreateNestedManyWithoutInboxInput = {
    create?: XOR<MessageCreateWithoutInboxInput, MessageUncheckedCreateWithoutInboxInput> | MessageCreateWithoutInboxInput[] | MessageUncheckedCreateWithoutInboxInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutInboxInput | MessageCreateOrConnectWithoutInboxInput[]
    createMany?: MessageCreateManyInboxInputEnvelope
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type MessageUpdateManyWithoutInboxNestedInput = {
    create?: XOR<MessageCreateWithoutInboxInput, MessageUncheckedCreateWithoutInboxInput> | MessageCreateWithoutInboxInput[] | MessageUncheckedCreateWithoutInboxInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutInboxInput | MessageCreateOrConnectWithoutInboxInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutInboxInput | MessageUpsertWithWhereUniqueWithoutInboxInput[]
    createMany?: MessageCreateManyInboxInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutInboxInput | MessageUpdateWithWhereUniqueWithoutInboxInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutInboxInput | MessageUpdateManyWithWhereWithoutInboxInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type MessageUncheckedUpdateManyWithoutInboxNestedInput = {
    create?: XOR<MessageCreateWithoutInboxInput, MessageUncheckedCreateWithoutInboxInput> | MessageCreateWithoutInboxInput[] | MessageUncheckedCreateWithoutInboxInput[]
    connectOrCreate?: MessageCreateOrConnectWithoutInboxInput | MessageCreateOrConnectWithoutInboxInput[]
    upsert?: MessageUpsertWithWhereUniqueWithoutInboxInput | MessageUpsertWithWhereUniqueWithoutInboxInput[]
    createMany?: MessageCreateManyInboxInputEnvelope
    set?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    disconnect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    delete?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    connect?: MessageWhereUniqueInput | MessageWhereUniqueInput[]
    update?: MessageUpdateWithWhereUniqueWithoutInboxInput | MessageUpdateWithWhereUniqueWithoutInboxInput[]
    updateMany?: MessageUpdateManyWithWhereWithoutInboxInput | MessageUpdateManyWithWhereWithoutInboxInput[]
    deleteMany?: MessageScalarWhereInput | MessageScalarWhereInput[]
  }

  export type InboxCreateNestedOneWithoutMessagesInput = {
    create?: XOR<InboxCreateWithoutMessagesInput, InboxUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: InboxCreateOrConnectWithoutMessagesInput
    connect?: InboxWhereUniqueInput
  }

  export type AttachmentCreateNestedManyWithoutMessageInput = {
    create?: XOR<AttachmentCreateWithoutMessageInput, AttachmentUncheckedCreateWithoutMessageInput> | AttachmentCreateWithoutMessageInput[] | AttachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMessageInput | AttachmentCreateOrConnectWithoutMessageInput[]
    createMany?: AttachmentCreateManyMessageInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type AttachmentUncheckedCreateNestedManyWithoutMessageInput = {
    create?: XOR<AttachmentCreateWithoutMessageInput, AttachmentUncheckedCreateWithoutMessageInput> | AttachmentCreateWithoutMessageInput[] | AttachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMessageInput | AttachmentCreateOrConnectWithoutMessageInput[]
    createMany?: AttachmentCreateManyMessageInputEnvelope
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumMessageStatusFieldUpdateOperationsInput = {
    set?: $Enums.MessageStatus
  }

  export type InboxUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<InboxCreateWithoutMessagesInput, InboxUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: InboxCreateOrConnectWithoutMessagesInput
    upsert?: InboxUpsertWithoutMessagesInput
    connect?: InboxWhereUniqueInput
    update?: XOR<XOR<InboxUpdateToOneWithWhereWithoutMessagesInput, InboxUpdateWithoutMessagesInput>, InboxUncheckedUpdateWithoutMessagesInput>
  }

  export type AttachmentUpdateManyWithoutMessageNestedInput = {
    create?: XOR<AttachmentCreateWithoutMessageInput, AttachmentUncheckedCreateWithoutMessageInput> | AttachmentCreateWithoutMessageInput[] | AttachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMessageInput | AttachmentCreateOrConnectWithoutMessageInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutMessageInput | AttachmentUpsertWithWhereUniqueWithoutMessageInput[]
    createMany?: AttachmentCreateManyMessageInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutMessageInput | AttachmentUpdateWithWhereUniqueWithoutMessageInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutMessageInput | AttachmentUpdateManyWithWhereWithoutMessageInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type AttachmentUncheckedUpdateManyWithoutMessageNestedInput = {
    create?: XOR<AttachmentCreateWithoutMessageInput, AttachmentUncheckedCreateWithoutMessageInput> | AttachmentCreateWithoutMessageInput[] | AttachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: AttachmentCreateOrConnectWithoutMessageInput | AttachmentCreateOrConnectWithoutMessageInput[]
    upsert?: AttachmentUpsertWithWhereUniqueWithoutMessageInput | AttachmentUpsertWithWhereUniqueWithoutMessageInput[]
    createMany?: AttachmentCreateManyMessageInputEnvelope
    set?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    disconnect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    delete?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    connect?: AttachmentWhereUniqueInput | AttachmentWhereUniqueInput[]
    update?: AttachmentUpdateWithWhereUniqueWithoutMessageInput | AttachmentUpdateWithWhereUniqueWithoutMessageInput[]
    updateMany?: AttachmentUpdateManyWithWhereWithoutMessageInput | AttachmentUpdateManyWithWhereWithoutMessageInput[]
    deleteMany?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
  }

  export type MessageCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<MessageCreateWithoutAttachmentsInput, MessageUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: MessageCreateOrConnectWithoutAttachmentsInput
    connect?: MessageWhereUniqueInput
  }

  export type MessageUpdateOneRequiredWithoutAttachmentsNestedInput = {
    create?: XOR<MessageCreateWithoutAttachmentsInput, MessageUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: MessageCreateOrConnectWithoutAttachmentsInput
    upsert?: MessageUpsertWithoutAttachmentsInput
    connect?: MessageWhereUniqueInput
    update?: XOR<XOR<MessageUpdateToOneWithWhereWithoutAttachmentsInput, MessageUpdateWithoutAttachmentsInput>, MessageUncheckedUpdateWithoutAttachmentsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumMessageStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusFilter<$PrismaModel> | $Enums.MessageStatus
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumMessageStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageStatus | EnumMessageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageStatus[] | ListEnumMessageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageStatusWithAggregatesFilter<$PrismaModel> | $Enums.MessageStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageStatusFilter<$PrismaModel>
    _max?: NestedEnumMessageStatusFilter<$PrismaModel>
  }

  export type MessageCreateWithoutInboxInput = {
    id?: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
    attachments?: AttachmentCreateNestedManyWithoutMessageInput
  }

  export type MessageUncheckedCreateWithoutInboxInput = {
    id?: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
    attachments?: AttachmentUncheckedCreateNestedManyWithoutMessageInput
  }

  export type MessageCreateOrConnectWithoutInboxInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutInboxInput, MessageUncheckedCreateWithoutInboxInput>
  }

  export type MessageCreateManyInboxInputEnvelope = {
    data: MessageCreateManyInboxInput | MessageCreateManyInboxInput[]
    skipDuplicates?: boolean
  }

  export type MessageUpsertWithWhereUniqueWithoutInboxInput = {
    where: MessageWhereUniqueInput
    update: XOR<MessageUpdateWithoutInboxInput, MessageUncheckedUpdateWithoutInboxInput>
    create: XOR<MessageCreateWithoutInboxInput, MessageUncheckedCreateWithoutInboxInput>
  }

  export type MessageUpdateWithWhereUniqueWithoutInboxInput = {
    where: MessageWhereUniqueInput
    data: XOR<MessageUpdateWithoutInboxInput, MessageUncheckedUpdateWithoutInboxInput>
  }

  export type MessageUpdateManyWithWhereWithoutInboxInput = {
    where: MessageScalarWhereInput
    data: XOR<MessageUpdateManyMutationInput, MessageUncheckedUpdateManyWithoutInboxInput>
  }

  export type MessageScalarWhereInput = {
    AND?: MessageScalarWhereInput | MessageScalarWhereInput[]
    OR?: MessageScalarWhereInput[]
    NOT?: MessageScalarWhereInput | MessageScalarWhereInput[]
    id?: StringFilter<"Message"> | string
    inboxId?: StringFilter<"Message"> | string
    fromAddress?: StringFilter<"Message"> | string
    fromName?: StringNullableFilter<"Message"> | string | null
    toAddress?: StringFilter<"Message"> | string
    subject?: StringNullableFilter<"Message"> | string | null
    textBody?: StringNullableFilter<"Message"> | string | null
    htmlBody?: StringNullableFilter<"Message"> | string | null
    rawObjectKey?: StringNullableFilter<"Message"> | string | null
    rawSizeBytes?: IntNullableFilter<"Message"> | number | null
    sizeBytes?: IntFilter<"Message"> | number
    status?: EnumMessageStatusFilter<"Message"> | $Enums.MessageStatus
    receivedAt?: DateTimeFilter<"Message"> | Date | string
    parsedAt?: DateTimeNullableFilter<"Message"> | Date | string | null
    expiresAt?: DateTimeFilter<"Message"> | Date | string
    errorMessage?: StringNullableFilter<"Message"> | string | null
  }

  export type InboxCreateWithoutMessagesInput = {
    id?: string
    address: string
    localPart: string
    domain: string
    createdAt?: Date | string
    expiresAt: Date | string
    lastExtendedAt?: Date | string | null
    extendCount?: number
    isDeleted?: boolean
    deletedAt?: Date | string | null
    tokenHash: string
  }

  export type InboxUncheckedCreateWithoutMessagesInput = {
    id?: string
    address: string
    localPart: string
    domain: string
    createdAt?: Date | string
    expiresAt: Date | string
    lastExtendedAt?: Date | string | null
    extendCount?: number
    isDeleted?: boolean
    deletedAt?: Date | string | null
    tokenHash: string
  }

  export type InboxCreateOrConnectWithoutMessagesInput = {
    where: InboxWhereUniqueInput
    create: XOR<InboxCreateWithoutMessagesInput, InboxUncheckedCreateWithoutMessagesInput>
  }

  export type AttachmentCreateWithoutMessageInput = {
    id?: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum?: string | null
    createdAt?: Date | string
    expiresAt: Date | string
  }

  export type AttachmentUncheckedCreateWithoutMessageInput = {
    id?: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum?: string | null
    createdAt?: Date | string
    expiresAt: Date | string
  }

  export type AttachmentCreateOrConnectWithoutMessageInput = {
    where: AttachmentWhereUniqueInput
    create: XOR<AttachmentCreateWithoutMessageInput, AttachmentUncheckedCreateWithoutMessageInput>
  }

  export type AttachmentCreateManyMessageInputEnvelope = {
    data: AttachmentCreateManyMessageInput | AttachmentCreateManyMessageInput[]
    skipDuplicates?: boolean
  }

  export type InboxUpsertWithoutMessagesInput = {
    update: XOR<InboxUpdateWithoutMessagesInput, InboxUncheckedUpdateWithoutMessagesInput>
    create: XOR<InboxCreateWithoutMessagesInput, InboxUncheckedCreateWithoutMessagesInput>
    where?: InboxWhereInput
  }

  export type InboxUpdateToOneWithWhereWithoutMessagesInput = {
    where?: InboxWhereInput
    data: XOR<InboxUpdateWithoutMessagesInput, InboxUncheckedUpdateWithoutMessagesInput>
  }

  export type InboxUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    localPart?: StringFieldUpdateOperationsInput | string
    domain?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastExtendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    extendCount?: IntFieldUpdateOperationsInput | number
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
  }

  export type InboxUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    localPart?: StringFieldUpdateOperationsInput | string
    domain?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastExtendedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    extendCount?: IntFieldUpdateOperationsInput | number
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    tokenHash?: StringFieldUpdateOperationsInput | string
  }

  export type AttachmentUpsertWithWhereUniqueWithoutMessageInput = {
    where: AttachmentWhereUniqueInput
    update: XOR<AttachmentUpdateWithoutMessageInput, AttachmentUncheckedUpdateWithoutMessageInput>
    create: XOR<AttachmentCreateWithoutMessageInput, AttachmentUncheckedCreateWithoutMessageInput>
  }

  export type AttachmentUpdateWithWhereUniqueWithoutMessageInput = {
    where: AttachmentWhereUniqueInput
    data: XOR<AttachmentUpdateWithoutMessageInput, AttachmentUncheckedUpdateWithoutMessageInput>
  }

  export type AttachmentUpdateManyWithWhereWithoutMessageInput = {
    where: AttachmentScalarWhereInput
    data: XOR<AttachmentUpdateManyMutationInput, AttachmentUncheckedUpdateManyWithoutMessageInput>
  }

  export type AttachmentScalarWhereInput = {
    AND?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
    OR?: AttachmentScalarWhereInput[]
    NOT?: AttachmentScalarWhereInput | AttachmentScalarWhereInput[]
    id?: StringFilter<"Attachment"> | string
    messageId?: StringFilter<"Attachment"> | string
    filename?: StringFilter<"Attachment"> | string
    contentType?: StringFilter<"Attachment"> | string
    sizeBytes?: IntFilter<"Attachment"> | number
    objectKey?: StringFilter<"Attachment"> | string
    checksum?: StringNullableFilter<"Attachment"> | string | null
    createdAt?: DateTimeFilter<"Attachment"> | Date | string
    expiresAt?: DateTimeFilter<"Attachment"> | Date | string
  }

  export type MessageCreateWithoutAttachmentsInput = {
    id?: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
    inbox: InboxCreateNestedOneWithoutMessagesInput
  }

  export type MessageUncheckedCreateWithoutAttachmentsInput = {
    id?: string
    inboxId: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
  }

  export type MessageCreateOrConnectWithoutAttachmentsInput = {
    where: MessageWhereUniqueInput
    create: XOR<MessageCreateWithoutAttachmentsInput, MessageUncheckedCreateWithoutAttachmentsInput>
  }

  export type MessageUpsertWithoutAttachmentsInput = {
    update: XOR<MessageUpdateWithoutAttachmentsInput, MessageUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<MessageCreateWithoutAttachmentsInput, MessageUncheckedCreateWithoutAttachmentsInput>
    where?: MessageWhereInput
  }

  export type MessageUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: MessageWhereInput
    data: XOR<MessageUpdateWithoutAttachmentsInput, MessageUncheckedUpdateWithoutAttachmentsInput>
  }

  export type MessageUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    inbox?: InboxUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type MessageUncheckedUpdateWithoutAttachmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    inboxId?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MessageCreateManyInboxInput = {
    id?: string
    fromAddress: string
    fromName?: string | null
    toAddress: string
    subject?: string | null
    textBody?: string | null
    htmlBody?: string | null
    rawObjectKey?: string | null
    rawSizeBytes?: number | null
    sizeBytes?: number
    status?: $Enums.MessageStatus
    receivedAt?: Date | string
    parsedAt?: Date | string | null
    expiresAt: Date | string
    errorMessage?: string | null
  }

  export type MessageUpdateWithoutInboxInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: AttachmentUpdateManyWithoutMessageNestedInput
  }

  export type MessageUncheckedUpdateWithoutInboxInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: AttachmentUncheckedUpdateManyWithoutMessageNestedInput
  }

  export type MessageUncheckedUpdateManyWithoutInboxInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromAddress?: StringFieldUpdateOperationsInput | string
    fromName?: NullableStringFieldUpdateOperationsInput | string | null
    toAddress?: StringFieldUpdateOperationsInput | string
    subject?: NullableStringFieldUpdateOperationsInput | string | null
    textBody?: NullableStringFieldUpdateOperationsInput | string | null
    htmlBody?: NullableStringFieldUpdateOperationsInput | string | null
    rawObjectKey?: NullableStringFieldUpdateOperationsInput | string | null
    rawSizeBytes?: NullableIntFieldUpdateOperationsInput | number | null
    sizeBytes?: IntFieldUpdateOperationsInput | number
    status?: EnumMessageStatusFieldUpdateOperationsInput | $Enums.MessageStatus
    receivedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AttachmentCreateManyMessageInput = {
    id?: string
    filename: string
    contentType: string
    sizeBytes: number
    objectKey: string
    checksum?: string | null
    createdAt?: Date | string
    expiresAt: Date | string
  }

  export type AttachmentUpdateWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttachmentUncheckedUpdateManyWithoutMessageInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    contentType?: StringFieldUpdateOperationsInput | string
    sizeBytes?: IntFieldUpdateOperationsInput | number
    objectKey?: StringFieldUpdateOperationsInput | string
    checksum?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}