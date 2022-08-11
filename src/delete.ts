import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import type { DeleteParams } from "react-admin";

export async function handleDelete(
  resource: string,
  params: DeleteParams,
  client: Client,
) {
  console.log("delete", resource, params);
  const { fields } = params.meta;

  const result = await client
    .mutation(
      gql`
        mutation Delete_${resource}($id: uuid!) {
          delete_${resource}_by_pk(id: $id) {
            ${fields?.[resource]}
          }
        }
      `,
      {
        id: params.id,
      },
    )
    .toPromise();
  return {
    data: result.data[`delete_${resource}_by_pk`],
  };
}
