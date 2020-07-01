import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ItemsTableDataSource, ItemsTableItem, ItemWrapper } from './items-table-datasource';
import { ItemsService } from '../api/services/items.service';
import { SearchService } from '../api/services/search.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss']
})
export class ItemsTableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ItemWrapper>;
  dataSource: ItemsTableDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['safeImage', 'title', 'priceFormatted', 'providerName', 'createdOn'];

  constructor(private itemsService: ItemsService, private searchService: SearchService, private domSanitizer: DomSanitizer) {
   
   
  }

  ngOnInit() {   
    this.dataSource = new ItemsTableDataSource(this.itemsService, this.searchService, this.domSanitizer);
    
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.table.renderRows();
  }
}
