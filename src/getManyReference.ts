import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import type { GetManyReferenceParams } from "react-admin";

export async function getManyReference(
  resource: string,
  params: GetManyReferenceParams,
  client: Client,
) {
  console.log("getManyReference", resource, params);
  const { target, id, sort, pagination, filter, meta } = params;
  const { fields } = meta;
  const { field, order } = sort;
  const { page, perPage } = pagination;

  const result = await client
    .query(
      gql`
        query ($limit: Int, $offset: Int, $order_by: [${resource}_order_by!], $where: ${resource}_bool_exp) {
            ${resource}(limit: $limit, offset: $offset, order_by: $order_by, where: $where) {
                ${fields?.[resource]}
            }
            ${resource}_aggregate(where: $where) {
                aggregate {
                    count
                }
            }
        }
      `,
      {
        limit: perPage,
        offset: (page - 1) * perPage,
        order_by: { [field]: order.toLowerCase() },
        where: Object.keys(filter).reduce(
          (prev, key) => ({
            ...prev,
            [key]: { _eq: filter[key] },
          }),
          { [target]: { _eq: id } },
        ),
      },
    )
    .toPromise();
  return {
    data: result.data[resource],
    total: result.data[`${resource}_aggregate`].aggregate.count,
  };
}
