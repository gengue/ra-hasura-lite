import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import isObject from "lodash/isObject";
import type { GetManyParams } from "react-admin";

export async function getMany(
  resource: string,
  params: GetManyParams,
  client: Client,
) {
  console.log("getMany", resource, params);
  const { fields } = params.meta;

  let { ids } = params;
  if (ids.length > 0 && isObject(ids[0])) {
    ids = ids.map((item: any) => item?.id ?? item);
  }

  const result = await client
    .query(
      gql`
        query GetMany_${resource}($where: ${resource}_bool_exp) {
                ${resource}(where: $where) {
                  ${fields}
                }
              }
      `,
      {
        where: {
          id: { _in: ids },
        },
      },
    )
    .toPromise();

  return { data: result?.data?.[resource] };
}
