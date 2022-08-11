import type { Client } from "@urql/core";
import type {
  CreateResult,
  DataProvider,
  GetListResult,
  GetManyReferenceResult,
  GetManyResult,
  GetOneResult,
  UpdateManyResult,
  UpdateResult,
} from "react-admin";

import { create } from "./create";
import { handleDelete } from "./delete";
import { deleteMany } from "./deleteMany";
import { getList } from "./getList";
import { getMany } from "./getMany";
import { getManyReference } from "./getManyReference";
import { getOne } from "./getOne";
import { update } from "./update";
import { updateMany } from "./updateMany";

export function injectFields<T>(
  client: Client,
  fields: any,
  handler: (...params: any) => Promise<T>,
  extendedQueries?: any
) {
  return (resource: string, props: any) => {
    const { extend } = props?.meta ?? {};
    const extended = extend ? extend : extendedQueries?.[resource];

    const injectedProps = {
      ...props,
      meta: {
        ...props?.meta,
        fields: fields?.[resource],
        extend: extended,
      },
    };

    return handler(resource, injectedProps, client);
  };
}

export const hasuraDataProvider = (
  client: Client,
  fields: any,
  extendedQueries?: any
): DataProvider => ({
  getList: injectFields<GetListResult>(
    client,
    fields,
    getList,
    extendedQueries
  ),
  getOne: injectFields<GetOneResult>(client, fields, getOne, extendedQueries),
  getMany: injectFields<GetManyResult>(
    client,
    fields,
    getMany,
    extendedQueries
  ),
  getManyReference: injectFields<GetManyReferenceResult>(
    client,
    fields,
    getManyReference,
    extendedQueries
  ),
  create: injectFields<CreateResult>(client, fields, create, extendedQueries),
  update: injectFields<UpdateResult>(client, fields, update, extendedQueries),
  updateMany: injectFields<UpdateManyResult>(
    client,
    fields,
    updateMany,
    extendedQueries
  ),
  delete: (...params) => handleDelete(...params, client),
  deleteMany: (...params) => deleteMany(...params, client),
});
