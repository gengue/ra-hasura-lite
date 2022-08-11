import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import omit from "lodash/omit";
import type { UpdateParams } from "react-admin";

import { transformRelationships } from "./transformRelationships";

export async function update(
  resource: string,
  params: UpdateParams,
  client: Client,
) {
  console.log("update", resource, params.data);
  const { fields, extend } = params.meta;
  const { data, insertRelationships, deleteRelationships } = transformRelationships(
    params.data,
    params.previousData,
    extend.relations,
  );

  const insertMutationsGql = insertRelationships
    .map((i, idx) => {
      return `
      insert_${i.entity}_${idx}: insert_${i.entity}(objects: $${i.entity}_${idx}_rel_data) {
        affected_rows
      }
    `;
    })
    .join("\n");

  const insertMutationsVars = insertRelationships.reduce((acc, i, idx) => {
    return {
      ...acc,
      [`${i.entity}_${idx}_rel_data`]: i.toInsert,
    };
  }, {});

  const insertMutationParams = insertRelationships
    .map(
      (i, idx) => `$${i.entity}_${idx}_rel_data: [${i.entity}_insert_input!]!`,
    )
    .join(", ");

  const deleteMutationsGql = deleteRelationships
    .map((item, idx) => {
      return `
      delete_${item.entity}_${idx}: delete_${item.entity}(where: { id: { _in: ${JSON.stringify(item.toDelete)} }}) {
        affected_rows
      }
    `;
    })
    .join("\n");

  const result = await client
    .mutation(
      gql`
        mutation Update_${resource}($id: uuid!, $data: ${resource}_set_input!, ${insertMutationParams}) {
            update_${resource}_by_pk(pk_columns: { id: $id }, _set: $data) {
                ${fields}
            }
            ${deleteMutationsGql}
            ${insertMutationsGql}
        }
      `,
      {
        id: params.id,
        data: omit(data, ["__typename"]),
        ...insertMutationsVars,
      },
    )
    .toPromise();
  return {
    data: result.data[`update_${resource}_by_pk`],
  };
}
