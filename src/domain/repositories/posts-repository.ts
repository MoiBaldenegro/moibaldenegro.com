import type { Post } from '../entities/post.ts';

export interface PostsRepository {
  getPosts(): Promise<Post[]>;
}

export class PostsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostsDataError';
  }
}

export function markdownPostRepository(){
  return {
    async getPosts(): Promise<Post[]> {
    let entries: Post[];
    try {
      entries = await loadArchitectureEntries();
    } catch {
      throw new PostsDataError(
        'architecture: no se pudieron leer los artículos de la colección',
      );
    }
    return entries ;
    }
  }
}

async function loadArchitectureEntries(): Promise<Post[]> {
  const { getCollection } = await import('astro:content');
  const collection = await getCollection('architecture');
  return collection.map((el) => {

    const {data} = el;

    return {
      id: el.id,
      slug: data.slug,
      title: data.title,
      author: data.author,
      img: data.img,
      readtime: data.readtime,
      description: data.description,
      tags: data.tags,
      created: data.created,
      updated: data.updated,
    };
  });
}

