import { Feature } from 'geojson';
import { ConfigService } from '@igo2/core';
import { Component, Input, OnInit, OnChanges, OnDestroy, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { EntityStore } from '../../shared';
import { SimpleEntityList, AttributeOrder, SortBy, Paginator } from './simple-entity-list.interface';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'igo-simple-entity-list',
  templateUrl: './simple-entity-list.component.html',
  styleUrls: ['./simple-entity-list.component.scss']
})

export class SimpleEntityListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() entityStore: EntityStore; // store that contains all the entities
  @Input() clickedFeatures: Array<Feature>; // an array that contains the features clicked in the map
  @Output() selection = new EventEmitter(); // an event emitter that outputs to the parent on a selection

  public entitiesAll: Array<any>; // an array containing all the entities in the store
  public entitiesShown: Array<object>; // an array containing the entities currently shown
  public entityIsSelected: boolean; // a boolean stating whether an entity has been selected in the list or not

  public simpleEntityListConfig: SimpleEntityList; // the simpleEntityList config input by the user
  public attributeOrder: AttributeOrder; // the attribute order specified in the simpleEntityList config
  public sortBy: SortBy; // the sorting to use, input in the SimpleEntityList config
  public formatURL: boolean; // whether to format an URL or not, input in the SimpleEntityList config
  public formatEmail: boolean; // whether to format an email or not, input in the SimpleEntityList config
  public paginator: Paginator; // the paginator config input, in the SimpleEntityList Config

  public pageSize: number; // the number of elements in a page, input in the paginator config
  public showFirstLastPageButtons: boolean; // whether to show the First page and Last page buttons or not, input in the paginator config
  public showPreviousNextPageButtons: boolean; // whether to show the Previous page and Next Page buttons or not, input in the paginator config

  public currentPageNumber$: BehaviorSubject<number> = new BehaviorSubject(1); // observable of the current page number
  public currentPageNumber$$: Subscription; // subscription to the current page number
  public numberOfPages: number; // calculated number of pages
  public elementsLowerBound: number; // the lowest index (+ 1) of an element in the current page
  public elementsUpperBound: number; /// the highest index (+ 1) of an element in the current page

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    // get the entities from the store
    this.entitiesAll = this.entityStore.all();

    // get the config input by the user
    this.simpleEntityListConfig = this.configService.getConfig('simpleEntityList');

    // get the attribute order to use to display the elements in the list
    this.attributeOrder = this.simpleEntityListConfig.attributeOrder;

    // get the sorting config and sort the entities accordingly (sort ascending by default)
    this.sortBy = this.simpleEntityListConfig.sortBy;

    if (this.sortBy) {
      this.sortEntities(this.entitiesAll);
    }

    // get the formatting configs for URLs and emails (not formatted by default)
    this.formatURL = this.simpleEntityListConfig.formatURL !== undefined ? this.simpleEntityListConfig.formatURL : false;
    this.formatEmail = this.simpleEntityListConfig.formatEmail !== undefined ? this.simpleEntityListConfig.formatEmail : false;

    // get the paginator config, including the page size, the buttons options and calculate the number of pages to use
    this.paginator = this.simpleEntityListConfig.paginator;

    if (this.paginator) {
      // 5 elements displayed by default
      this.pageSize = this.paginator.pageSize !== undefined ? this.paginator.pageSize : 5;
      // all buttons shown by default
      this.showFirstLastPageButtons = this.paginator.showFirstLastPageButtons !== undefined ?
        this.paginator.showFirstLastPageButtons : true;
      this.showPreviousNextPageButtons = this.paginator.showPreviousNextPageButtons !== undefined ?
        this.paginator.showPreviousNextPageButtons : true;
      // calculate number of pages and indexes
      this.numberOfPages = Math.ceil(this.entitiesAll.length / this.pageSize);
    }

    // subscribe to the current page number
    this.currentPageNumber$$ = this.currentPageNumber$.subscribe((currentPageNumber: number) => {
      // if there is a paginator...
      if (this.paginator) {
        // ...calculate the new lower and upper bounds to display
        this.elementsLowerBound = (currentPageNumber - 1) * this.pageSize + 1;
        this.elementsUpperBound = currentPageNumber * this.pageSize > this.entitiesAll.length ? this.entitiesAll.length :
          currentPageNumber * this.pageSize;

        // slice the entities to show the current ones
        this.entitiesShown = this.entitiesAll.slice(this.elementsLowerBound - 1, this.elementsUpperBound);
      // if no paginator is present...
      } else {
        // bounds are fixed by number of entities
        this.elementsLowerBound = 1;
        this.elementsUpperBound = this.entitiesAll.length;
        this.entitiesShown = this.entitiesAll;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // if the most recent change is a click on entities on the map...
    if (!changes.clickedFeatures.firstChange) {
      this.entityStore.state.updateAll({selected: false});
      const clickedFeatures: Array<Feature> = changes.clickedFeatures.currentValue as Array<Feature>;
      // if at least one entity has been clicked...
      if (clickedFeatures?.length > 0 && clickedFeatures !== undefined) {
        // strip ids and update status
        this.stripIdsUpdateStatus(clickedFeatures);
        // ... if one entity has been selected, change status for button in list
        this.entityIsSelected = clickedFeatures.length === 1 ? true : false;
        // emit to parent for zoom
        this.selection.emit();
      // if no entity has been clicked...
      } else {
        // ...show all entities and reset status
        this.entityIsSelected = false;
        this.entitiesAll = this.entityStore.all() as Array<object>;
        this.currentPageNumber$.next(this.currentPageNumber$.getValue());
      }
    }
  }

  ngOnDestroy() {
    this.currentPageNumber$$.unsubscribe();
  }

  /**
   * @description Sort entities according to an attribute
   * @param entities The entities to sort
   */
   sortEntities(entities: Array<object>) {
    if (this.sortBy.order === undefined || this.sortBy.order === 'ascending') {
      entities.sort((a, b) => (a['properties'][this.sortBy.attributeName] > b['properties'][this.sortBy.attributeName]) ? 1 :
      ((b['properties'][this.sortBy.attributeName] > a['properties'][this.sortBy.attributeName]) ? -1 : 0));
    } else if (this.sortBy.order === 'descending') {
      entities.sort((a, b) => (a['properties'][this.sortBy.attributeName] > b['properties'][this.sortBy.attributeName]) ? -1 :
      ((b['properties'][this.sortBy.attributeName] > a['properties'][this.sortBy.attributeName]) ? 1 : 0));
    }
  }

  /**
   * @description Check if an attribute has to be formatted and format it if necessary
   * @param attribute A "raw" attribute from an entity
   * @returns A potentially formatted attribute
   */
  checkAttributeFormatting(attribute: any) {
    attribute = this.isPhoneNumber(attribute);
    attribute = this.isPostalCode(attribute);
    attribute = this.isURLOrEmail(attribute);

    return attribute;
  }

  /**
   * @description Create a personnalized attribute or a formatted attribute
   * @param entity An entity
   * @param attribute The attribute to get or to create
   * @returns The personnalized or formatted attribute as a string
   */
  createAttribute(entity: any, attribute: any): string {
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
   * @description Create a personnalized attribute
   * @param entity The entity containing the attribute
   * @param personalizedFormatting The personnalized formatting specified by the user in the config
   * @returns A personnalized attribute
   */
  createPersonalizedAttribute(entity: any, personalizedFormatting: string): string {
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
   * @description Format an attribute representing a phone number if the string matches the given pattern
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
   * @description Format an attribute representing a postal code if the string matches the given pattern
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
   * @description Format an attribute representing an URL or an email address if the string matches the given pattern
   * @param attribute The attribute to format
   * @returns A formatted string representing an URL or an email address or the original attribute
   */
  isURLOrEmail(attribute: any): any {
    let possibleURL: string = '' + attribute;
    const matchURL: Array<string> = possibleURL.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (matchURL) {
      let possibleEmail: string = '' + attribute;
      const matchEmail: Array<string> = possibleEmail.match(/^\S+@\S+\.\S+$/);
      if (matchEmail && this.formatEmail) {
        return `<a href="mailto:${matchEmail[0]}">Courriel</a>`;
      } else if (matchEmail && !this.formatEmail) {
        return `<a href="mailto:${matchEmail[0]}">${matchEmail[0]}</a>`;
      } else if (this.formatURL) {
        return `<a href="${matchURL[0]}" target="_blank">Site Web</a>`;
      } else if (!this.formatURL) {
        return `<a href="${matchURL[0]}" target="_blank">${matchURL[0]}</a>`;
      }
    }
    return attribute;
  }

  /**
   * @description Fired when the user selects an entity in the list
   * @param entity
   */
  selectEntity(entity: object): void {
    // update entities shown in list
    this.entitiesShown = [entity];
    this.entityIsSelected = true;

    // update status of entity and emit to parent for zoom
    this.entityStore.state.updateAll({selected: false});
    this.entityStore.state.update(entity, {selected: true}, true);
    this.selection.emit();
  }

  /**
   * @description Fired when the user unselects the entity in the list
   */
  unselectEntity(): void {
    // show all entities and update their status
    this.entityStore.state.updateAll({selected: false});
    this.entitiesAll = this.entityStore.all() as Array<object>;
    this.entityIsSelected = false;
    this.currentPageNumber$.next(this.currentPageNumber$.getValue());
  }

  /**
   * @description Fired when the user changes the page and update the current page number
   * @param currentPageNumber The current page number
   */
  onPageChange(currentPageNumber: number) {
    this.currentPageNumber$.next(currentPageNumber);
  }

  /**
   * @description Extract ids and update 'selected' status of clicked entities
   * @param clickedEntities The entities clicked in the map
   */
  stripIdsUpdateStatus(clickedEntities: Array<any>) {
    let entities = [];
    // for every clicked entity...
    for (let clickedEntity of clickedEntities) {
      if (clickedEntity.meta?.id) {
        //... strip the id
        const id: string = clickedEntity.meta.id;
        const match: Array<string> = id.match(/[^.]*$/);
        if (match) {
          const strippedId = parseInt(match[0]);
          for (let entity of this.entitiesAll) {
            //... and update status of corresponding entity in list
            if (entity.meta.id === strippedId) {
              entities.push(entity);
              this.entityStore.state.update(entity, {selected: true}, true);
            }
          }
        }
      }
    }
    // update entities shown in list
    this.entitiesShown = entities;
  }
}
