import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import omit from "lodash/omit";
import type { UpdateManyParams } from "react-admin";

export async function updateMany(
  resource: string,
  params: UpdateManyParams,
  client: Client,
) {
  console.log("updateMany", resource, params.data);
  const result = await client
    .mutation(
      gql`
        mutation UpdateMany_${resource}($where: ${resource}_bool_exp!, $data: ${resource}_set_input!) {
            update_${resource}(where: $where, _set: $data) {
                affected_rows
            }
        }
      `,
      {
        where: {
          id: { _in: params.ids },
        },
        data: omit(params.data, ["__typename"]),
      },
    )
    .toPromise();

  console.log("result", result);

  return {
    data: params.ids,
  };
}
