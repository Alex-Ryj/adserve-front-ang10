import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { Item } from '../api/models/item';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ItemsService } from '../api/services/items.service';
import { SearchService } from '../api/services/search.service';
import { ItemsPage } from '../api/models/items-page';

// TODO: Replace this with your own data model type
export interface ItemsTableItem {
  name: string;
  id: number;
}

export class ItemWrapper { item: Item; safeImage: SafeResourceUrl; }

/**
 * Data source for the ItemsTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ItemsTableDataSource extends DataSource<ItemWrapper> {
  paginator: MatPaginator;
  sort: MatSort;
  pageNum = 1;
  totalCount: number;
  itemsPerPage = 10;
  totalPages: number;
  searchOn = false;
  searchWords: string;
  providerName = 'eBay';
  sortedField = 'title';
  sortedDesc = false;
  data: ItemWrapper[] = [];

  constructor(private itemsService: ItemsService, private searchService: SearchService, private domSanitizer: DomSanitizer) {
    super();
    this.getItems(this.providerName, this.sortedField, this.sortedDesc, this.pageNum, this.itemsPerPage);    
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ItemWrapper[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ItemWrapper[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ItemWrapper[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'title': return compare(a.item.title, b.item.title, isAsc);
        case 'priceFormatted': return compare(+a.item.price, +b.item.price, isAsc);
        case 'createdOn': return compare(+a.item.createdOn, +b.item.createdOn, isAsc);
        default: return 0;
      }
    });
  }

  getItems(_providerName: string, _sortedField: string, _sortedDesc: boolean, _pageNum: number, _itemsPerPage: number): void {
    this.itemsService.getItemsByPage({ providerName: _providerName, sortedField: _sortedField, sortedDesc: _sortedDesc, 
      pageNum: _pageNum, itemsPerPage: _itemsPerPage })
      .subscribe(result => this.processResult(result));
  }

  searchItems(_searchWords: string, _maxItems: number, _pageNum: number, _itemsPerPage: number): void {
    this.searchService.getItemsSearchByPage({ searchWords: _searchWords, maxItems: _maxItems, pageNum: _pageNum, itemsPerPage: _itemsPerPage
    }).subscribe(result => this.processResult(result));
  }

  processResult(result: ItemsPage) {
    this.data.length = 0;
    result.items.forEach(item => {
      const itemWrapper = new ItemWrapper();
      itemWrapper.item = item;
      itemWrapper.safeImage = this.domSanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + item.image64BaseStr);
      this.data.push(itemWrapper);
      console.log('processed result');
    });
    this.totalCount = result.totalCount;
    this.totalPages = Math.ceil(this.totalCount / this.itemsPerPage);  
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
