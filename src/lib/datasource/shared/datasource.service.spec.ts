import { TestBed, inject } from "@angular/core/testing";
import { HttpClientModule } from "@angular/common/http";

import { IgoCoreModule } from "../../core";
import { IgoAuthModule } from "../../auth";

import { CapabilitiesService } from "./capabilities.service";
import { DataSourceService } from "./datasource.service";
import { WFSDataSourceService } from "./datasources/wfs-datasource.service";
import { ArcGISRestDataSourceService } from "./datasources/arcgisrest-datasource.service";

describe("DataSourceService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot(),
        IgoAuthModule.forRoot()
      ],
      providers: [
        CapabilitiesService,
        DataSourceService,
        WFSDataSourceService,
        ArcGISRestDataSourceService
      ]
    });
  });

  it("should ...", inject([DataSourceService], (service: DataSourceService) => {
    expect(service).toBeTruthy();
  }));
});
