import path from 'path';
import { z, defineCollection } from 'astro:content';
const glob = import.meta.glob('./**/*.md'); /* vite */

export const collectionNames = Object.keys(glob).map((filepath) => 
    path.basename(path.dirname(filepath))
);
const schema = {
  schema: z.object({
    title: z.string()
  })
};

function assignCollection(acc, name) {
  return Object.assign(acc, { [name.toString()]: defineCollection({ ...schema }) });
} 

export const collections = collectionNames.reduce(assignCollection, {});