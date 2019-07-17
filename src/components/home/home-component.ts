import { SharedState } from '../../shared/state/shared-state';
import { ArticleService } from "../../shared/services/article-service"
import { TagService } from '../../shared/services/tag-service';
import { inject } from '@aurelia/kernel';
import { customElement } from '@aurelia/runtime';
import template from './home-component.html';
import { Article } from '../editor/editor-component';

@inject(SharedState, ArticleService, TagService)
@customElement({ name: 'home-component', template })
export class HomeComponent {
  private articles: Article[] = [];
  private shownList = 'all';
  private tags: string[] = [];
  private filterTag = undefined;
  private pageNumber: number;
  private totalPages: number[];
  private currentPage = 1;
  private limit = 10;

  constructor(private readonly sharedState: SharedState, private readonly articleService: ArticleService, private readonly tagService: TagService) {
    console.log(sharedState)
  }

  attached() {
    this.getArticles();
    this.getTags();
  }

  getArticles() {
    let params = {
      limit: this.limit,
      tag: undefined,
      offset: this.limit * (this.currentPage - 1)
    };
    if (this.filterTag !== undefined)
      params.tag = this.filterTag;
    this.articleService.getList(this.shownList, params)
      .then(response => {
        this.articles = response.articles;

        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        this.totalPages = Array.from(new Array(Math.ceil(response.articlesCount / this.limit)), (val, index) => index + 1);
      })
  }

  getTags() {
    this.tagService.getList()
      .then(response => {
        this.tags = response;
      })
  }

  setListTo(type, tag) {
    if (type === 'feed' && !this.sharedState.isAuthenticated) return;
    this.shownList = type;
    this.filterTag = tag;
    this.getArticles();
  }

  getFeedLinkClass() {
    let clazz = '';
    if (!this.sharedState.isAuthenticated)
      clazz += ' disabled';
    if (this.shownList === 'feed')
      clazz += ' active';
    return clazz;
  }

  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.getArticles();
  }
}
