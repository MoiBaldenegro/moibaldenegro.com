
// export interface PostsRepository {
//   getPosts(): Promise<Post[]>;
// }

export class PostsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostsDataError';
  }
}

export async function markdownPostRepository(){

  const { getCollection } = await import('astro:content');
  let collection =  [];

  return {
    async getPosts(){
    try {
        collection = await getCollection('architecture');
    } catch {
      throw new PostsDataError(
        'architecture: no se pudieron leer los artículos de la colección',
      );
    }
    return collection;
    }
  }
}

