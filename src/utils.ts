import type { ASTNode } from "graphql";
import { print } from "graphql/language/printer";

// transform a value to regex string with accented characters
// this is meant to be used as `SIMILAR TO` hasura query
export const getRegexValue = (value: string): string => {
  return value
    .replaceAll("a", "(A|À|Á|Â|Ã|Ä|Å|a|à|á|â|ã|ä|å|ã)")
    .replaceAll("e", "(e|E|È|É|Ê|Ë|è|é|ê|ë)")
    .replaceAll("i", "(i|I|Ì|Í|Î|Ï|ì|í|î|ï)")
    .replaceAll("u", "(u|U|ü|Ü|Ù|Ú|Û|Ü|ù|ú|û|ü)")
    .replaceAll("o", "(O|Ò|Ó|Ô|Õ|Õ|Ö|Ø|o|ò|ó|ô|õ|ö|ø)")
    .replaceAll("n", "(N|Ñ|n|ñ)")
    .replaceAll("s", "(S|Š|s|š)")
    .replaceAll("y", "(Y|Ÿ|y|ÿ|ý)")
    .replaceAll("z", "(Z|Ž|z|ž)");
};

export const extractFieldsFromQuery = (queryAst: any): ASTNode => {
  return queryAst.definitions[0].selectionSet.selections;
};

export const getExtendedQuery = (query: any): string => {
  return print(extractFieldsFromQuery(query));
};
