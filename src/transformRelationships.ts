import differenceBy from "lodash/differenceBy";

export function transformRelationships(
  data: any,
  prevData: any,
  relationshipDefinitions: any[],
) {
  const insertRelationships: any[] = [];
  const deleteRelationships: any[] = [];

  if (relationshipDefinitions?.length > 0) {
    for (const [key, value] of Object.entries(data)) {
      const conf = relationshipDefinitions.find((i) => i.entity === key);
      if (conf && Array.isArray(value)) {
        const oldValue = prevData?.[key];
        insertRelationships.push({
          ...conf,
          toInsert: differenceBy(value, oldValue, conf.related).map(
            (i: any) => ({
              [conf.foreign]: data?.id,
              [conf.related]: i?.[conf.related],
              // @TODO implement pivot values (e.g contact info values)
            }),
          ),
        });
        deleteRelationships.push({
          ...conf,
          toDelete: differenceBy(oldValue, value, conf.related).map(
            (i: any) => i?.id || i?.[conf.related],
          ),
        });
        delete data[key];
      }
    }
  }

  return { data, insertRelationships, deleteRelationships };
}
