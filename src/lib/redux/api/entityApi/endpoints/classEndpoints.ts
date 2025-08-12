
import { Class, ClassSchema } from '@/types/index';
import { generateEndpoint } from '../utils';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';

export const classEndpoints = (builder: EndpointBuilder<any, any, any>) => {
  const { get, create, update, remove } = generateEndpoint<
    Class,
    ClassSchema,
    ClassSchema & { id: number }
  >('class');

  return {
    getClasses: builder.query(get),
    createClass: builder.mutation(create),
    updateClass: builder.mutation(update),
    deleteClass: builder.mutation(remove),
  };
};
