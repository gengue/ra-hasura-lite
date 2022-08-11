import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import type { DeleteManyParams } from "react-admin";

export async function deleteMany(
  resource: string,
  params: DeleteManyParams,
  client: Client,
) {
  console.log("deleteMany", resource, params);

  const result = await client
    .mutation(
      gql`
        mutation DeleteMany_${resource}($where: ${resource}_bool_exp!) {
          delete_${resource}(where: $where) {
            affected_rows
          }
        }
      `,
      {
        where: {
          id: { _in: params.ids },
        },
      },
    )
    .toPromise();

  console.log(result);

  return {
    data: params.ids,
  };
}
