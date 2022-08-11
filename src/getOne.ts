import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import type { GetOneParams } from "react-admin";

import { getExtendedQuery } from "./utils";

export async function getOne(
  resource: string,
  params: GetOneParams,
  client: Client,
) {
  console.log("getOne", resource, params);
  const { id, meta } = params;
  const { fields, extend } = meta;

  const extraFields = getExtendedQuery(extend?.detail);

  const result = await client
    .query(
      gql`
        query GetOne_${resource}($id: uuid!) {
            ${resource}_by_pk(id: $id) {
                ${fields}
                ${extraFields}
            }
        }
      `,
      { id },
    )
    .toPromise();
  return { data: result?.data[`${resource}_by_pk`] };
}
