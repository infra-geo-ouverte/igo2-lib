import { Feature } from 'geojson';
import { ConfigService } from '@igo2/core';
import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { EntityStore } from '../../shared';
import { SimpleFeatureList, AttributeOrder, SortBy, Paginator } from './simple-feature-list.interface';

@Component({
  selector: 'igo-simple-feature-list',
  templateUrl: './simple-feature-list.component.html',
  styleUrls: ['./simple-feature-list.component.scss']
})

export class SimpleFeatureListComponent implements OnInit, OnChanges {
  @Input() entityStore: EntityStore<Array<Feature>>; // a store that contains all the entities
  @Input() clickedEntities: Array<Feature>; // an array that contains the entities clicked in the map
  @Output() listSelection = new EventEmitter(); // an event emitter that outputs the entity selected in the list

  public entities: Array<Array<Feature>>;
  public entitiesToShow: Array<Array<Feature>>;

  public simpleFeatureListConfig: SimpleFeatureList; // the config input by the user
  public attributeOrder: AttributeOrder; // the attribute order specified by the user in the config
  public sortBy: SortBy; // the sorting to use input by the user in the config
  public formatURL: boolean; // whether to format an URL or not (input by the user in the config)
  public formatEmail: boolean; // whether to format an email or not (input by the user in the config)
  public paginator: Paginator; // the paginator config input by the user

  public pageSize: number; // the number of elements in a page, input by the user
  public showFirstLastPageButtons: boolean; // whether to show the First page and Last page buttons or not, input by the user
  public showPreviousNextPageButtons: boolean; // whether to show the Previous page and Next Page buttons or not, input by the user
  public entityIsSelected: boolean = false; // whether a single entity is selected or not
  public entitiesAreSelected: boolean = false; // wheter multiple entities are selected or not
  public selectedEntities: Array<Feature> = undefined; // an array containing the selected entities
  public selectedEntity: Feature = undefined; // the selected entity

  public numberOfPages: number; // calculated number of pages
  public elementsLowerBound: number; // the index of the lowest element in the current page
  public elementsUpperBound: number; // the index of the highest element in the current page

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    // get the entities from the layer/store
    this.entities = this.entityStore.entities$.value;

    // get the config input by the user
    this.simpleFeatureListConfig = this.configService.getConfig('simpleFeatureList');

    // get the attribute order to use to display the elements in the list
    this.attributeOrder = this.simpleFeatureListConfig.attributeOrder;
    this.sortBy = this.simpleFeatureListConfig.sortBy;
    if (this.sortBy) {
      if (this.sortBy.order === undefined || this.sortBy.order === 'ascending') {
        this.entities.sort((a, b) => (a['properties'][this.sortBy.attributeName] > b['properties'][this.sortBy.attributeName]) ? 1 :
        ((b['properties'][this.sortBy.attributeName] > a['properties'][this.sortBy.attributeName]) ? -1 : 0));
      } else if (this.sortBy.order === 'descending') {
        this.entities.sort((a, b) => (a['properties'][this.sortBy.attributeName] > b['properties'][this.sortBy.attributeName]) ? -1 :
        ((b['properties'][this.sortBy.attributeName] > a['properties'][this.sortBy.attributeName]) ? 1 : 0));
      }
    }

    // get the formmating configs for URLs and emails
    this.formatURL = this.simpleFeatureListConfig.formatURL !== undefined ? this.simpleFeatureListConfig.formatURL : false;
    this.formatEmail = this.simpleFeatureListConfig.formatEmail !== undefined ? this.simpleFeatureListConfig.formatEmail : false;

    // get the paginator config, including the page size, the buttons options and calculate the number of pages to use
    this.paginator = this.simpleFeatureListConfig.paginator;
    if (this.paginator) {
      this.pageSize = this.paginator.pageSize !== undefined ? this.paginator.pageSize : 5;
      this.showFirstLastPageButtons = this.paginator.showFirstLastPageButtons !== undefined ?
        this.paginator.showFirstLastPageButtons : true;
      this.showPreviousNextPageButtons = this.paginator.showPreviousNextPageButtons !== undefined ?
        this.paginator.showPreviousNextPageButtons : true;
      this.entitiesToShow = this.entities.slice(0, this.pageSize);
      this.numberOfPages = Math.ceil(this.entities.length / this.pageSize);
      this.elementsLowerBound = 1;
      this.elementsUpperBound = this.pageSize > this.entities.length ? this.entities.length : this.pageSize;
    } else {
      this.entitiesToShow = this.entities;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.clickedEntities.currentValue?.length > 0 && changes.clickedEntities.currentValue !== undefined) {
      if (changes.clickedEntities.currentValue.length > 1) {
        this.selectedEntities = changes.clickedEntities.currentValue;
        this.selectedEntity = undefined;
        this.entitiesAreSelected = true;
        this.entityIsSelected = false;
      } else {
        this.selectedEntities = undefined;
        this.selectedEntity = changes.clickedEntities.currentValue[0];
        this.entitiesAreSelected = false;
        this.entityIsSelected = true;
      }
    } else {
      this.selectedEntities = undefined;
      this.selectedEntity = undefined;
      this.entitiesAreSelected = false;
      this.entityIsSelected = false;
    }
  }

  checkAttributeFormatting(attribute: any) {
    attribute = this.isPhoneNumber(attribute);
    attribute = this.isPostalCode(attribute);
    attribute = this.isUrl(attribute);
    attribute = this.isEmail(attribute);

    return attribute;
  }

  createAttribute(entity: Feature, attribute: any): string {
    let value: string;
    if (attribute.personalizedFormatting) {
      value = this.createPersonalizedAttribute(entity, attribute.personalizedFormatting);
    } else {
      value = this.checkAttributeFormatting(entity.properties[attribute.attributeName]);
    }
    return value;
  }

  createPersonalizedAttribute(entity: Feature, personalizedFormatting: string): string {
    let personalizedAttribute = personalizedFormatting;

    const attributeList: Array<string> = personalizedFormatting.match(/(?<=\[)(.*?)(?=\])/g);

    attributeList.forEach(attribute => {
      personalizedAttribute = personalizedAttribute.replace(attribute, this.checkAttributeFormatting(entity.properties[attribute]));
    });
    personalizedAttribute = personalizedAttribute.replace(/[\[\]]/g, '');
    personalizedAttribute = personalizedAttribute.replace(/^([^A-zÀ-ÿ0-9])*|([^A-zÀ-ÿ0-9])*$/g, '');
    return personalizedAttribute;
  }

  isPhoneNumber(attribute: any): any {
    let possiblePhoneNumber: string = ('' + attribute).replace(/\D/g, '');
    const match: Array<string> = possiblePhoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `<a href="tel:+1${match[0]}">(${match[1]}) ${match[2]}-${match[3]}</a>`;
    }
    return attribute;
  }

  isEmail(attribute: any): any {
    let possibleEmail: string = '' + attribute;
    const match: Array<string> = possibleEmail.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
    if (match && this.formatEmail) {
      return `<a href="mailto:${match[0]}">Courriel</a>`;
    } else if (match && !this.formatEmail) {
      return `<a href="mailto:${match[0]}">${match[0]}</a>`;
    }
    return attribute;
  }

  isPostalCode(attribute: any): any {
    let possiblePostalCode: string = '' + attribute;
    const match: Array<string> = possiblePostalCode.match(/^([A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z])[ -]?(\d[A-CEGHJ-NPR-TV-Z]\d)$/i);
    if (match) {
      return (match[1] + ' ' + match [2]).toUpperCase();
    }
    return attribute;
  }

  isUrl(attribute: any): any {
    let possibleURL: string = '' + attribute;
    const match: Array<string> = possibleURL.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (match && this.formatURL) {
      return `<a href="${match[0]}" target="_blank">Site Web</a>`;
    } else if (match && !this.formatURL) {
      return `<a href="${match[0]}" target="_blank">${match[0]}</a>`;
    }
    return attribute;
  }

  selectEntity(entity: any) {
    this.entitiesAreSelected = false;
    this.entityIsSelected = true;
    this.selectedEntities = undefined;
    this.selectedEntity = entity;

    this.entityStore.state.update(entity, {selected: true}, true);
    let entityCollection: {added: any[]} = {added: []};
    entityCollection.added.push(entity);
    this.listSelection.emit(entityCollection);
  }

  unselectEntity() {
    this.entitiesAreSelected = false;
    this.entityIsSelected = false;
    this.selectedEntities = undefined;
    this.selectedEntity = undefined;
  }

  onPageChange(currentPage: number) {
    this.elementsLowerBound = (currentPage - 1) * this.pageSize + 1;
    this.elementsUpperBound = currentPage * this.pageSize > this.entities.length ? this.entities.length : currentPage * this.pageSize;
    this.entitiesToShow = this.entities.slice(this.elementsLowerBound - 1, this.elementsUpperBound);
  }
}
