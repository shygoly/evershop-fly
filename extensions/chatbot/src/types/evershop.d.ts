declare module '@evershop/evershop/lib/widget' {
  export function registerWidget(config: any): void;
}

declare module '@evershop/evershop/lib/helpers' {
  export const CONSTANTS: {
    LIBPATH: string;
  };
}

declare module '@evershop/evershop/lib/postgres' {
  export const pool: any;
  export const getConnection: any;
}

declare module '@evershop/evershop/lib/postgres/connection.js' {
  const connection: any;
  export const pool: any;
  export default connection;
}

declare module '@evershop/postgres-query-builder' {
  const queryBuilder: any;
  export default queryBuilder;
  export const insert: any;
  export const select: any;
  export const update: any;
  export const execute: any;
  export type PoolClient = any;
}

declare module '@evershop/evershop/graphql/services' {
  export const getGraphQLClient: any;
  export const setContextValue: any;
}

declare module '@components/common/form/Field' {
  export const Field: any;
}

declare module '@evershop/evershop/src/components/common/form/Field' {
  export const Field: any;
}

declare module 'express-serve-static-core' {
  interface Response {
    $body?: any;
  }
}


