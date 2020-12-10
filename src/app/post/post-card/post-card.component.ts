import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Post } from '../post.model';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent implements OnInit, OnDestroy {
  public isLoading = false;
  public postCreated: Post;
  private mode: string = 'create';
  private postId: string;
  public post: Post;
  form: FormGroup;
  imagePreview: string = '';
  private authStatusSub: Subscription;

  constructor(private postService: PostService, public route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(auth => this.isLoading = false);
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      content: new FormControl(null),
      image : new FormControl(null, {asyncValidators: [mimeType]})
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postService.getPost(this.postId).subscribe(postData => {
          this.post = {id: postData.id, title: postData.title, content: postData.content, imagePath: postData.imagePath, creator: postData.creator};
          this.form.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath})
        });
      } 
      else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  onPostAdded() {
    if(this.form.invalid) return;
    const postNew = {
      id: '',
      title: this.form.value.title,
      content: this.form.value.content,
      imagePath: this.form.value.image,
      creator: null
    };
    if(this.mode === 'edit')
    this.postService.updatePost(this.postId, postNew.title, postNew.content, this.form.value.image);
    else 
    this.postService.addPost(postNew);

    this.form.reset();
  }

  onImagePicked(event: Event) {
    const inpFile = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: inpFile});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(inpFile);
  }
}
