import type { Client } from "@urql/core";
import { gql } from "@urql/core";
import { isArray, omit } from "lodash";
import type { CreateParams } from "react-admin";

import { getExtendedQuery } from "./utils";

type Relation = {
  entity: string;
  foreign: string;
  related: string;
};

const transformRelations = (form: any, relations: Relation[]) => {
  for (const rel of relations) {
    const ids = form?.[rel.entity]; // array of related ids
    if (ids && isArray(ids)) {
      form[rel.entity] = {
        data: ids.map((id) => ({
          [rel.foreign]: form?.id,
          [rel.related]: id,
        })),
      };
    }
  }

  return form;
};

export async function create(
  resource: string,
  props: CreateParams,
  client: Client,
) {
  console.log("create", resource, props);
  const { meta, data } = props;
  const { fields, relations, extend } = meta;
  const extraFields = getExtendedQuery(extend?.detail);
  const form = transformRelations(omit(data, ["__typename"]), relations);

  const result = await client
    .mutation(
      gql`
        mutation ($data: ${resource}_insert_input!) {
            insert_${resource}_one(object: $data) {
                ${fields}
                ${extraFields}
            }
        }
      `,
      {
        data: form,
      },
    )
    .toPromise();
  return {
    data: result.data[`insert_${resource}_one`],
  };
}
