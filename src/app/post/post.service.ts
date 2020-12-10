import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from './post.model';
import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({
  providedIn: 'root',
})
export class PostService {
  public posts = new Subject<{ posts: Post[], postCount: number }>();
  public maxCount: number;
  private postArray: Post[];

  constructor(private http:HttpClient, private router: Router) { }

  getPosts(postsPerPage, currPage): Observable<{ posts: Post[], postCount: number}> {
    const queryParams = `?pageSize=${postsPerPage}&page=${currPage}`
    this.http.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL + queryParams)
    .pipe(map((postData) => {
        return { posts: postData.posts.map(post => {
          console.log(post);
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            imagePath: post.imagePath,
            creator: post.creator
          };
        }),
        maxPosts: postData.maxPosts
      };
      })).subscribe((data) => {
        this.postArray = data.posts;
        this.maxCount = data.maxPosts;
        this.posts.next({ posts: [...this.postArray], postCount: this.maxCount });
      });
    return this.posts.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{id: string, title: string, content: string, imagePath: string, creator: string}>(BACKEND_URL+ id);
  }

  addPost(postReceived: Post) {
    const postData = new FormData();
    postData.append("title", postReceived.title);
    postData.append("content", postReceived.content);
    postData.append("image", postReceived.imagePath, postReceived.title);
    if(postReceived){
        this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
        .subscribe((responseData) => {
          console.log("RESPONSE DATA" , responseData);
        const postLocal: Post = {
          id: responseData.post.id,
          title: postReceived.title,
          content: postReceived.content,
          imagePath: responseData.post.imagePath,
          creator: responseData.post.creator
        };
        this.postArray.push(postLocal);
        this.posts.next({posts: [...this.postArray], postCount: this.maxCount });
        this.router.navigate(["/"]);
        });
    }
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData;
    if(typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    }
    else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }
    this.http.put(BACKEND_URL + id, postData)
    .subscribe(response => {
      console.log(response)
      const updatePosts = [...this.postArray];
      const oldPostIndx = updatePosts.findIndex(p => p.id === postData.id);
      const post = {
        id: id,
        title: title,
        content: content,
        imagePath: postData.image,
        creator: postData.creator
      };
      updatePosts[oldPostIndx] = post;
      this.postArray = updatePosts;
      this.posts.next({ posts: [...this.postArray], postCount: this.maxCount });
      this.router.navigate(["/"]);
    });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
