import { Component, OnInit, Input } from '@angular/core';

import { Post } from '../post.model';
import { PostService } from '../post.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {
  public isLoading: boolean;
  public userIsAuthenticated: boolean = false;
  public userId: string;
  public panelOpenState = false;
  public posts: Post[] = [];
  public allPosts: number = 0;
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  public currPage = 1;
  public postsPerPage = 2;
  constructor(private postService: PostService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsSub = this.postService.getPosts(this.postsPerPage, this.currPage).subscribe((postData: {posts: Post[], postCount: number}) => {
      this.posts = postData.posts;
      this.allPosts = postData.postCount;
      this.isLoading = false;
    });
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getAuthStatus();

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      }
    );
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currPage)
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onChangePagedMethod(pageData) {
    this.currPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;

    this.postService.getPosts(this.postsPerPage, this.currPage);
  }
}
