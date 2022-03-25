import { ConfigService } from '@igo2/core';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { EntityStore } from '../shared';

export interface SimpleFeatureListConfig {
  show: boolean,
  layerId: string,
  attributeOrder: AttributeOrder,
  sortBy: {attributeName: string, order: string},
  formatURL: boolean,
  formatEmail: boolean
}

export interface AttributeOrder {
  attributeName: string,
  personalizedFormatting: string,
  description: string,
  header: string
}
@Component({
  selector: 'igo-simple-feature-list',
  templateUrl: './simple-feature-list.component.html',
  styleUrls: ['./simple-feature-list.component.scss']
})

export class SimpleFeatureListComponent implements OnInit {

  @Input() entityStore: EntityStore<object>;

  @Output() listSelection = new EventEmitter();

  public entities: Array<Object>;
  public simpleFeatureListConfig: SimpleFeatureListConfig;
  public sortBy: {attributeName: string, order: string};
  public attributeOrder: AttributeOrder;
  public formatURL: boolean;
  public formatEmail: boolean;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.entities = this.entityStore.entities$.value;
    this.simpleFeatureListConfig = this.configService.getConfig('simpleFeatureList');
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
    this.attributeOrder = this.simpleFeatureListConfig.attributeOrder;
    this.formatURL = this.simpleFeatureListConfig.formatURL !== undefined ? this.simpleFeatureListConfig.formatURL : false;
    this.formatEmail = this.simpleFeatureListConfig.formatEmail !== undefined ? this.simpleFeatureListConfig.formatEmail : false;
  }

  checkAttributeFormatting(attribute: any) {
    attribute = this.isPhoneNumber(attribute);
    attribute = this.isEmail(attribute);
    attribute = this.isPostalCode(attribute);
    attribute = this.isUrl(attribute);

    return attribute;
  }

  createAttribute(entity: any, attribute: any): string {
    let value: string;

    if (attribute.personalizedFormatting) {
      value = this.createPersonalizedAttribute(entity, attribute.personalizedFormatting);
    } else {
      value = this.checkAttributeFormatting(entity.properties[attribute.attributeName]);
    }
    return value;
  }

  createPersonalizedAttribute(entity: any, personalizedFormatting: string): string {
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

  selectElement(entity: any) {
    let entityCollection: {added: any[]} = {added: []};
    entityCollection.added.push(entity);
    this.listSelection.emit(entityCollection);
  }
}
