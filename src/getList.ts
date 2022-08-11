import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import { isArray, isNumber, isObject, isString, set } from "lodash";
import type { GetListParams } from "react-admin";

import { getExtendedQuery, getRegexValue } from "./utils";

const getExp = (value: any, operation = "_eq") => {
  const startOperation = operation.replace("_start", "");

  switch (operation) {
    case "_like":
    case "_nlike":
    case "_ilike":
      return { [operation]: `%${value}%` };
    case "_like_start":
    case "_nlike_start":
    case "_ilike_start":
      return { [startOperation]: `${value}%` };
    case "_similar":
    case "_nsimilar":
      return { [operation]: `%${getRegexValue(value)}%` };
    case "_similar_start":
    case "_nsimilar_start":
      return { [startOperation]: `${getRegexValue(value)}%` };
    case "_in":
      return { [operation]: isArray(value) ? value : [value] };
    default:
      return { [operation]: value };
  }
};

const OP_TOKEN = "@";
const REL_TOKEN = "->";
const COLUMN_SEP = ",";

type WhereExp = {
  _and?: any[];
  _or?: any[];
};
/*
 * buildWhere
 * @example
 * Input: first_name,last_name@_ilike
 * Output:
 * {
 *    _or: [
 *      { first_name: { _ilike: '%first_name%' } },
 *      { last_name: { _ilike: '%last_name%' } }
 *    ]
 * }
 */
function buildWhere(filter: any, isSubQuery = false) {
  const andVars: any[] = [];
  const orVars: any[] = [];
  const where: WhereExp = {};

  for (const [key, value] of Object.entries<any>(filter)) {
    // when an operation is specified
    if (key.includes(OP_TOKEN)) {
      const [fieldsPart, operation] = key.split(OP_TOKEN);
      const fields = fieldsPart.split(COLUMN_SEP);
      for (const field of fields) {
        const exp = set({}, field.split(REL_TOKEN), getExp(value, operation));
        if (fields.length > 1) {
          orVars.push(exp);
        } else {
          andVars.push(exp);
        }
      }
    } // custom hasura query
    else if (value?.format === "hasura-raw-query") {
      andVars.push(set({}, key, value?.value));
    } // no operation is specified. it must be inferred from the value
    else if (isArray(value)) {
      const isArrayOfScalars = value.every(
        (v: any) => isNumber(v) || isString(v),
      );
      if (isArrayOfScalars) {
        andVars.push(set({}, key, getExp(value, "_in")));
      }
    } else if (isObject(value)) {
      const subWhere = buildWhere(value, true);
      andVars.push(set({}, key, subWhere));
    } else {
      // fallback to direct comparison with the value
      andVars.push(set({}, key, getExp(value, "_eq")));
    }
  }

  if (andVars.length > 0) {
    where._and = andVars;
  }
  if (orVars.length > 0) {
    where._or = orVars;
  }

  // to be embedded in a subquery, we need to remove the _and/_or
  if (isSubQuery) {
    return where?._and?.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  return where;
}

export async function getList(
  resource: string,
  props: GetListParams,
  client: Client,
) {
  console.log("getList", resource, props);
  const { sort, pagination, filter, meta } = props;
  const { field, order } = sort;
  const { page, perPage } = pagination;
  const { fields, extend } = meta;

  const extraFields = getExtendedQuery(extend?.list);

  const result = await client
    .query(
      gql`
        query GetList_${resource}($limit: Int, $offset: Int, $order_by: [${resource}_order_by!], $where: ${resource}_bool_exp) {
            data: ${resource}(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
                ${fields}
                ${extraFields}
            }
            count: ${resource}_aggregate(where: $where) {
                aggregate {
                    count
                }
            }
        }
      `,
      {
        limit: perPage,
        offset: (page - 1) * perPage,
        order_by: set({}, field, order.toLowerCase()),
        where: buildWhere(filter),
      },
    )
    .toPromise();
  return {
    data: result?.data?.data,
    total: result?.data?.count?.aggregate?.count,
  };
}
