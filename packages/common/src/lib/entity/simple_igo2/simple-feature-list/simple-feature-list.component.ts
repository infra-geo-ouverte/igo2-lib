import { Feature } from 'geojson';
import { ConfigService } from '@igo2/core';
import { Component, Input, OnInit, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { EntityStore } from '../../shared';
import { SimpleFeatureList, AttributeOrder, SortBy, Paginator } from './simple-feature-list.interface';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'igo-simple-feature-list',
  templateUrl: './simple-feature-list.component.html',
  styleUrls: ['./simple-feature-list.component.scss']
})

export class SimpleFeatureListComponent implements OnInit, OnChanges {
  @Input() entityStore: EntityStore; // a store that contains all the entities
  @Input() clickedEntities: Array<Feature>; // an array that contains the entities clicked in the map
  @Output() listSelection = new EventEmitter(); // an event emitter that outputs the entity selected in the list

  public entities: Array<Feature>; // an array containing all the entities in the store
  public entitiesToShow: Array<Feature>; // an array containing the entities to show in a specific page

  public simpleFeatureListConfig: SimpleFeatureList; // the simpleFeatureList config input by the user
  public attributeOrder: AttributeOrder; // the attribute order specified by the user in the config
  public sortBy: SortBy; // the sorting to use input by the user in the config
  public formatURL: boolean; // whether to format an URL or not (input by the user in the config)
  public formatEmail: boolean; // whether to format an email or not (input by the user in the config)
  public paginator: Paginator; // the paginator config input by the user

  public pageSize: number; // the number of elements in a page, input by the user
  public showFirstLastPageButtons: boolean; // whether to show the First page and Last page buttons or not, input by the user
  public showPreviousNextPageButtons: boolean; // whether to show the Previous page and Next Page buttons or not, input by the user

  public currentPageNumber$: BehaviorSubject<number> = new BehaviorSubject(1); // observalbe of current page number
  public currentPageNumber$$: Subscription; // subscription to current page number
  public numberOfPages: number; // calculated number of pages
  public elementsLowerBound: number; // the lowest index (+ 1) of an element in the current page
  public elementsUpperBound: number; /// the highest index (+ 1) of an element in the current page

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    // get the entities from the layer/store
    this.entities = this.entityStore.entities$.getValue() as Array<Feature>;

    // get the config input by the user
    this.simpleFeatureListConfig = this.configService.getConfig('simpleFeatureList');

    // get the attribute order input by the user to use to display the elements in the list
    this.attributeOrder = this.simpleFeatureListConfig.attributeOrder;

    // get the sorting config input by the user and sort the entities accordingly (sort ascending by default)
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

    // suscribe to the current page number
    this.currentPageNumber$$ = this.currentPageNumber$.subscribe((currentPageNumber: number) => {
      // calculate the new lower and upper bounds to display
      this.elementsLowerBound = (currentPageNumber - 1) * this.pageSize + 1;
      this.elementsUpperBound = currentPageNumber * this.pageSize > this.entities.length ? this.entities.length :
        currentPageNumber * this.pageSize;

      // slice the entities to show the current ones
      this.entitiesToShow = this.entities.slice(this.elementsLowerBound - 1, this.elementsUpperBound);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.entityStore.state.updateAll({selected: false});
    const clickedEntities: Array<Feature> = changes.clickedEntities.currentValue as Array<Feature>;
    // when a user clicks on entities on the map, if an entity or entities have been clicked...
    if (clickedEntities.length > 0 && clickedEntities !== undefined) {
      // ...show current entities in list
      this.entityStore.state.updateMany(clickedEntities, {selected: true});
    // else show all entities in list
    } else {
      this.entitiesToShow = this.entityStore.entities$.getValue() as Array<Feature>;
      this.currentPageNumber$.next(this.currentPageNumber$.getValue());
    }
  }

  /**
   * @description Checks if an attribute has to be formatted and formats it if necessary
   * @param attribute A raw attributed from an entity
   * @returns A formatted attribute
   */
  checkAttributeFormatting(attribute: any) {
    attribute = this.isPhoneNumber(attribute);
    attribute = this.isPostalCode(attribute);
    attribute = this.isURL(attribute);
    attribute = this.isEmail(attribute);

    return attribute;
  }

  /**
   * @description Creates a personnalized attribute or a formatted attribute
   * @param entity An entity
   * @param attribute The attribute to get or to create
   * @returns The attribute as a string
   */
  createAttribute(entity: Feature, attribute: any): string {
    let newAttribute: string;
    // if the attribute has a personnalized attribute input by the user in the config...
    if (attribute.personalizedFormatting) {
      newAttribute = this.createPersonalizedAttribute(entity, attribute.personalizedFormatting);
    // if the attribute is not personnalized...
    } else {
      newAttribute = this.checkAttributeFormatting(entity.properties[attribute.attributeName]);
    }
    return newAttribute;
  }

  /**
   * @description Creates a personnalized attribute
   * @param entity The entity containing the attribute
   * @param personalizedFormatting The personnalized formatting specified by the user in the config
   * @returns A personnalized attribute
   */
  createPersonalizedAttribute(entity: Feature, personalizedFormatting: string): string {
    let personalizedAttribute: string = personalizedFormatting;

    // get the attributes for the personnalized attribute
    const attributeList: Array<string> = personalizedFormatting.match(/(?<=\[)(.*?)(?=\])/g);

    // for each attribute in the list...
    attributeList.forEach(attribute => {
      // ...get the attibute value, format it if needed and replace it in the string
      personalizedAttribute = personalizedAttribute.replace(attribute, this.checkAttributeFormatting(entity.properties[attribute]));
    });
    // remove the square brackets surrounding the attributes
    personalizedAttribute = personalizedAttribute.replace(/[\[\]]/g, '');
    personalizedAttribute = personalizedAttribute.replace(/^([^A-zÀ-ÿ0-9])*|([^A-zÀ-ÿ0-9])*$/g, '');

    return personalizedAttribute;
  }

  /**
   * @description Formats an attribute representing a phone number if the string matches the given pattern
   * @param attribute The attribute to format
   * @returns A formatted string representing a phone number or the original attribute
   */
  isPhoneNumber(attribute: any): any {
    let possiblePhoneNumber: string = ('' + attribute).replace(/\D/g, '');
    const match: Array<string> = possiblePhoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `<a href="tel:+1${match[0]}">(${match[1]}) ${match[2]}-${match[3]}</a>`;
    }
    return attribute;
  }

  /**
   * @description Formats an attribute representing an email address if the string matches the given pattern
   * @param attribute The attribute to format
   * @returns A formatted string representing an email address or the original attribute
   */
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

  /**
   * @description Formats an attribute representing a postal code if the string matches the given pattern
   * @param attribute The attribute to format
   * @returns A formatted string representing a postal code or the original attribute
   */
  isPostalCode(attribute: any): any {
    let possiblePostalCode: string = '' + attribute;
    const match: Array<string> = possiblePostalCode.match(/^([A-CEGHJ-NPR-TVXY]\d[A-CEGHJ-NPR-TV-Z])[ -]?(\d[A-CEGHJ-NPR-TV-Z]\d)$/i);
    if (match) {
      return (match[1] + ' ' + match [2]).toUpperCase();
    }
    return attribute;
  }

  /**
   * @description Formats an attribute representing an URL if the string matches the given pattern
   * @param attribute The attribute to format
   * @returns A formatted string representing an URL or the original attribute
   */
  isURL(attribute: any): any {
    let possibleURL: string = '' + attribute;
    const match: Array<string> = possibleURL.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (match && this.formatURL) {
      return `<a href="${match[0]}" target="_blank">Site Web</a>`;
    } else if (match && !this.formatURL) {
      return `<a href="${match[0]}" target="_blank">${match[0]}</a>`;
    }
    return attribute;
  }

  /**
   * @description Fired when the user selects an entity in the list
   * @param entity
   */
  selectEntity(entity: Feature) {
    this.entitiesToShow = [entity];

    // update the store and emit the entity to parent
    this.entityStore.state.update(entity, {selected: true}, true);
    let entityCollection: {added: Array<Feature>} = {added: []};
    entityCollection.added.push(entity);
    this.listSelection.emit(entityCollection);
  }

  /**
   * @description Fired when the user unselects the entity in the list
   */
  unselectEntity(entity: Feature) {
    // show all entities
    this.entitiesToShow = this.entityStore.entities$.getValue() as Array<Feature>;
    this.currentPageNumber$.next(this.currentPageNumber$.getValue());
    this.entityStore.state.update(entity, {selected: false}, true);
  }

  /**
   * @description Fired when the user changes the page
   * @param currentPageNumber The current page number
   */
  onPageChange(currentPageNumber: number) {
    // update the current page number
    this.currentPageNumber$.next(currentPageNumber);
  }
}
