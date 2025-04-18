# [17.0.0-next.7](https://github.com/infra-geo-ouverte/igo2-lib/compare/v17.0.0-next.4...v17.0.0-next.7) (2024-05-16)

### Bug Fixes

- **auth:** use IgoAuthModule instead of TranslateModule ([3277105](https://github.com/infra-geo-ouverte/igo2-lib/commit/3277105d19bddc852c1fe8d2c5ccb5d3495e9fd7))
- **common:** export EntityOperation like it used to ([#1658](https://github.com/infra-geo-ouverte/igo2-lib/issues/1658)) ([32bbddb](https://github.com/infra-geo-ouverte/igo2-lib/commit/32bbddb261a8fbfe076efd3e9e54ed14942fd567))
- **context:** add workspace option with layers when we export context ([#1660](https://github.com/infra-geo-ouverte/igo2-lib/issues/1660)) ([a904cbd](https://github.com/infra-geo-ouverte/igo2-lib/commit/a904cbd065cbe7c4d9017f45a6d1618e067ba0e7))
- **core:** remove duplicated load of config BREAKING CHANGE ([ae2dd97](https://github.com/infra-geo-ouverte/igo2-lib/commit/ae2dd976e1ec11bc60010220f2761257e0ff826d))
- **geo:** ensure ogc filter accept today and now ([#1622](https://github.com/infra-geo-ouverte/igo2-lib/issues/1622)) ([551e258](https://github.com/infra-geo-ouverte/igo2-lib/commit/551e258a91fb3b35c1ede58d5145eaa52b5c70f3))
- **geo:** import and export shp file ([#1665](https://github.com/infra-geo-ouverte/igo2-lib/issues/1665)) ([67725f7](https://github.com/infra-geo-ouverte/igo2-lib/commit/67725f774f6e8e303577d0e26818a8d177a89669))
- **geo:** inporting vector (igo2 issues [#1146](https://github.com/infra-geo-ouverte/igo2-lib/issues/1146)) ([fb9d1eb](https://github.com/infra-geo-ouverte/igo2-lib/commit/fb9d1eb641d8bc6e04a75f425f0d6996361a8308))
- **geo:** Print set the same horizontal margin for the map ([#1662](https://github.com/infra-geo-ouverte/igo2-lib/issues/1662)) ([ca633c1](https://github.com/infra-geo-ouverte/igo2-lib/commit/ca633c1f24cab90e24615609b98e94e9e142f0dd))
- **geo:** register svg icon for layer-list ([de1fa78](https://github.com/infra-geo-ouverte/igo2-lib/commit/de1fa78ec27deb72829e258cd38cba02b044c0eb))
- **icon:** revert some icon change ([04fd431](https://github.com/infra-geo-ouverte/igo2-lib/commit/04fd43157210212151781016da06efa8b44ba1a8))
- **integration:** check if workspace search source is defined ([#1609](https://github.com/infra-geo-ouverte/igo2-lib/issues/1609)) ([0fd5c83](https://github.com/infra-geo-ouverte/igo2-lib/commit/0fd5c8393e63af565e14d28f803cac7443d2f4f4))
- **integration:** update coordinate if projection system change ([#1661](https://github.com/infra-geo-ouverte/igo2-lib/issues/1661)) ([382f913](https://github.com/infra-geo-ouverte/igo2-lib/commit/382f9137598ca415515f9a56eb65f92c1b5192c9))
- **search-bar:** trigger search on click ([114f911](https://github.com/infra-geo-ouverte/igo2-lib/commit/114f9114ad2d7c4c7a111f15d11a799b2474dcbb))
- **utils:** remove moment.js and delete datetime.utils BREAKING CHANGE- This file was added in the v16 but was not documented. Maybe we could mute this one ([c08cdd1](https://github.com/infra-geo-ouverte/igo2-lib/commit/c08cdd1e322a4a342e3bcc98365adf083bd0cf76))
- **utils:** Vitejs raise an error without the default import ([9354bd3](https://github.com/infra-geo-ouverte/igo2-lib/commit/9354bd3d981869ad6f425e2d34df99737ffa4f6f))

### Features

- **auth:** configure auth with provider ([e046947](https://github.com/infra-geo-ouverte/igo2-lib/commit/e046947fbcbe65008227779cd1f2a95d5ae2e061))
- **auth:** remove auth.module for circular dependency ([2bc4906](https://github.com/infra-geo-ouverte/igo2-lib/commit/2bc4906e5a4004365f15a94d0b82b031075723e4))
- **directions:** added possibility to toggle between two routing sources ([#1644](https://github.com/infra-geo-ouverte/igo2-lib/issues/1644)) ([ef607e2](https://github.com/infra-geo-ouverte/igo2-lib/commit/ef607e2df80ad53f5b4587413f80f882c0bdb40b))
- **geo:** add modularity for search and direction ([#1669](https://github.com/infra-geo-ouverte/igo2-lib/issues/1669)) ([cd199eb](https://github.com/infra-geo-ouverte/igo2-lib/commit/cd199ebe69b39d4ca98a0898cb39b3fc211d5469))
- **geo:** update Openlayers to v9 ([#1642](https://github.com/infra-geo-ouverte/igo2-lib/issues/1642)) ([06ed562](https://github.com/infra-geo-ouverte/igo2-lib/commit/06ed5623dcd65e329aa7d85d76dcd4a6bdcb8a0f))
- **integration:** catalog keep selection when changing tools ([#1654](https://github.com/infra-geo-ouverte/igo2-lib/issues/1654)) ([946d9f4](https://github.com/infra-geo-ouverte/igo2-lib/commit/946d9f4a7cca13703c87f667b6efb174653da8d6))
- replace our icon library @mdi/angular-material with the Google Font - Material Symbol ([#1664](https://github.com/infra-geo-ouverte/igo2-lib/issues/1664)) ([f74c495](https://github.com/infra-geo-ouverte/igo2-lib/commit/f74c495db129502af99c8e6a16579b103e97d3a3))

### BREAKING CHANGES

- **geo:** - SearchState and SearchService no more provided in root. They depend on the SearchSource who are no more provided in the root.

* Analytics capability is provided with the SearchService directly.
* DirectionModule, provideDirectionsSourceService is removed, use the provideDirection.

- **auth:** Replace by provideAuth and call the component directly
- **auth:** AuthModule is deprecated and use the provideAuthentification for the configuration

# [17.0.0-next.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/v17.0.0-next.3...v17.0.0-next.4) (2024-03-13)

### Bug Fixes

- **auth:** include submodule scss ([8b40bcf](https://github.com/infra-geo-ouverte/igo2-lib/commit/8b40bcfaf6817c57ed8b8f6a9bef112423771ce3))
- **context:** poi-button add PoiService provider ([7388ac4](https://github.com/infra-geo-ouverte/igo2-lib/commit/7388ac405c7c3226c602cba50c467cbb44f5aff2))
- **context:** revert change causing duplicate list ([fd525c2](https://github.com/infra-geo-ouverte/igo2-lib/commit/fd525c22a9ae9456c9471e91d3b203d86fd2eb72))

# [17.0.0-next.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/v17.0.0-next.2...v17.0.0-next.3) (2024-03-12)

# [17.0.0-next.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/v17.0.0-next.0...v17.0.0-next.2) (2024-03-08)

- Core Refactor - migrate to secondary entrypoints to optimize the bundle size (#1625) ([4aeca83](https://github.com/infra-geo-ouverte/igo2-lib/commit/4aeca83cb64316e9f8ef938ae6e62c2ae87b96f0)), closes [#1625](https://github.com/infra-geo-ouverte/igo2-lib/issues/1625) [#1556](https://github.com/infra-geo-ouverte/igo2-lib/issues/1556)

### BREAKING CHANGES

- IgoLanguageModule don't import TranslateModule.forRoot
  defaultLanguageLoader is not exported anymore
- 'provideDefaultLanguageLoader' and 'provideLanguageLoader' are replaced by 'DEFAULT_LANGUAGE_LOADER' and set directly inside the TranslationConfig

- build(packagr): keep only one config

- feat(core): split in submodule for bundle optimization BREAKING CHANGES

* refact(compression): convert and move to utils packages BREAKING CHANGE

- build(clean-exports): account all keys in the exports object

# [17.0.0-next.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.3.0...v17.0.0-next.0) (2024-02-19)

### Bug Fixes

- **build:** clean up exports in the distributed package.json [#1616](https://github.com/infra-geo-ouverte/igo2-lib/issues/1616) ([#1617](https://github.com/infra-geo-ouverte/igo2-lib/issues/1617)) ([ecd7013](https://github.com/infra-geo-ouverte/igo2-lib/commit/ecd7013c1561e8054870b7b48d1a44e5cde73fcf))
- bump node engine version to a min of 18.13 ([e95a1ca](https://github.com/infra-geo-ouverte/igo2-lib/commit/e95a1cab3b866d3f3549d888552fc6d990b9bb02))
- **geo:** check Capability contains layers list before loop ([#1570](https://github.com/infra-geo-ouverte/igo2-lib/issues/1570)) ([f4959eb](https://github.com/infra-geo-ouverte/igo2-lib/commit/f4959eb78cc8c6c76c3b77507ea393a0ed7ea502))
- **geo:** garantine no comma in the beginning and end of search term ([#1608](https://github.com/infra-geo-ouverte/igo2-lib/issues/1608)) ([d5e20f8](https://github.com/infra-geo-ouverte/igo2-lib/commit/d5e20f8fe8d4a91d33dfc4a450743a07c49b0f65))
- **integration:** fix advanced coordinate error Maximum call stack size exceeded ([#1620](https://github.com/infra-geo-ouverte/igo2-lib/issues/1620)) ([f0c5db6](https://github.com/infra-geo-ouverte/igo2-lib/commit/f0c5db60f1ef57f2720d8853041bf3189704b15c))
- missing auth dependencies in geo and integration ([5269984](https://github.com/infra-geo-ouverte/igo2-lib/commit/5269984e60a0c491ce1514e9b26cdd4becf1b999))

- Release/17.0.0 (#1640) ([0cd2dcf](https://github.com/infra-geo-ouverte/igo2-lib/commit/0cd2dcf83111238405cd243807f07f64d98a3e2f)), closes [#1640](https://github.com/infra-geo-ouverte/igo2-lib/issues/1640) [#1551](https://github.com/infra-geo-ouverte/igo2-lib/issues/1551) [#1543](https://github.com/infra-geo-ouverte/igo2-lib/issues/1543) [#1563](https://github.com/infra-geo-ouverte/igo2-lib/issues/1563) [#1556](https://github.com/infra-geo-ouverte/igo2-lib/issues/1556) [#1610](https://github.com/infra-geo-ouverte/igo2-lib/issues/1610) [#1619](https://github.com/infra-geo-ouverte/igo2-lib/issues/1619)

### Features

- **geo:** change printed text to Sans Serif font ([#1626](https://github.com/infra-geo-ouverte/igo2-lib/issues/1626)) ([748099a](https://github.com/infra-geo-ouverte/igo2-lib/commit/748099ab375da70dd1baf5d3cee892765260cd1a))

### BREAKING CHANGES

- IgoLanguageModule don't import TranslateModule.forRoot
  defaultLanguageLoader is not exported anymore

* provideDefaultLanguageLoader and provideLanguageLoader are replaced by DEFAULT_LANGUAGE_LOADER and set directly inside the TranslationConfig

- feat(demo): Convert all components, directives and pipes to standalone
- ToolboxColor is now a type

# [16.3.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.2.0...v16.3.0) (2024-01-25)

### Bug Fixes

- **geo:** check legend before loop ([#1591](https://github.com/infra-geo-ouverte/igo2-lib/issues/1591)) ([e7ad0bb](https://github.com/infra-geo-ouverte/igo2-lib/commit/e7ad0bb605ab75097051540a93aa545280c63965))
- sass exports for themes and utils ([#1589](https://github.com/infra-geo-ouverte/igo2-lib/issues/1589)) ([643d6fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/643d6fcd7feedbe72e5cda50f13521fe285aa69b))

### Features

- **geo:** add a sub level to arcgisrest catalogs ([#1592](https://github.com/infra-geo-ouverte/igo2-lib/issues/1592)) ([e3b5246](https://github.com/infra-geo-ouverte/igo2-lib/commit/e3b52463ce21f7858dfa1e5994194c9c7980e113))
- **geo:** provide a method to select the featuremotion when adding searchresult as overlay ([#1587](https://github.com/infra-geo-ouverte/igo2-lib/issues/1587)) ([afe56d5](https://github.com/infra-geo-ouverte/igo2-lib/commit/afe56d5aa6330062eef881a977d33bce21b9d7d3))
- **integration:** add a new tool to report data issues ([#1524](https://github.com/infra-geo-ouverte/igo2-lib/issues/1524)) ([1b6b5c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/1b6b5c6d3daace6fde4c22a6aaafe8b3afc3ccdc))

# [16.2.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.1.1...v16.2.0) (2024-01-19)

### Bug Fixes

- **demo:** Repoint web services in assembly demo ([#1557](https://github.com/infra-geo-ouverte/igo2-lib/issues/1557)) ([b714937](https://github.com/infra-geo-ouverte/igo2-lib/commit/b714937e771f15aa51d71c26b8ee1210467e3b5f))
- **demo:** update layers option in print and ogc filter ([#1571](https://github.com/infra-geo-ouverte/igo2-lib/issues/1571)) ([f5a0186](https://github.com/infra-geo-ouverte/igo2-lib/commit/f5a018642ee739e3631f6ca19ffd582446b7f823))
- **geo/search-pointer&hover:** init the store before subscription ([#1569](https://github.com/infra-geo-ouverte/igo2-lib/issues/1569)) ([773695a](https://github.com/infra-geo-ouverte/igo2-lib/commit/773695a26e793ea246430a9fa5d3b55bd98e5beb))
- **geo:** Baselayer Switcher stay open without useStaticIcon ([#1548](https://github.com/infra-geo-ouverte/igo2-lib/issues/1548)) ([4c6cebd](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c6cebd35a2af39795057055e135011b9146a7f4))
- **geo:** check catalog not undefined before loading items ([#1583](https://github.com/infra-geo-ouverte/igo2-lib/issues/1583)) ([1efb4a6](https://github.com/infra-geo-ouverte/igo2-lib/commit/1efb4a6de3fad6652e862bd1773b37e1a20d760c))
- **geo:** initial rotation is not supplied to viewcontroller ([#1586](https://github.com/infra-geo-ouverte/igo2-lib/issues/1586)) ([edb29c3](https://github.com/infra-geo-ouverte/igo2-lib/commit/edb29c33d681f5977365af2f6f6cd997aebe74fe))

### Features

- **demo:** add layer showcase for multiple styles ([#1581](https://github.com/infra-geo-ouverte/igo2-lib/issues/1581)) ([a00975e](https://github.com/infra-geo-ouverte/igo2-lib/commit/a00975e58c9d458d508532830fcb12e71af59753))
- **linked-layers:** Added new config for visibility in Base Layer Switcher ([#1560](https://github.com/infra-geo-ouverte/igo2-lib/issues/1560)) ([0c35c3d](https://github.com/infra-geo-ouverte/igo2-lib/commit/0c35c3d338692866776f84ed5f67ab225330c619))

### Reverts

- **common/store:** remove EntityStoreWithStrategy0 ([297f96e](https://github.com/infra-geo-ouverte/igo2-lib/commit/297f96e7535bc0507547e5f9be81889a82ea5a7d))

## [16.1.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.1.0...v16.1.1) (2023-12-14)

# [16.1.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.0.2...v16.1.0) (2023-12-12)

### Bug Fixes

- **auth:** expose auth-monitoring ([f936023](https://github.com/infra-geo-ouverte/igo2-lib/commit/f93602326c169f31df8dc0fcdbb7036c5d65813c))
- **common:** Context menu doesn't work on Firefox ([#1494](https://github.com/infra-geo-ouverte/igo2-lib/issues/1494)) ([65776d2](https://github.com/infra-geo-ouverte/igo2-lib/commit/65776d2b3076776603467ee03e526471b15e6ade))
- **common:** fix sidenav button scrollUp and scrolldown ([#1493](https://github.com/infra-geo-ouverte/igo2-lib/issues/1493)) ([da807d9](https://github.com/infra-geo-ouverte/igo2-lib/commit/da807d969eb88ec7a5cb5c066084e4c96bcc567c))
- **common:** prevent form submit on password hide/show and auto hide password after 10sec of inactivity ([#1536](https://github.com/infra-geo-ouverte/igo2-lib/issues/1536)) ([499a8a0](https://github.com/infra-geo-ouverte/igo2-lib/commit/499a8a0747728a3f9506abee142fe9ed82c866bb))
- **common:** solve Select or unselect all rows at once ([#1513](https://github.com/infra-geo-ouverte/igo2-lib/issues/1513)) ([37669a9](https://github.com/infra-geo-ouverte/igo2-lib/commit/37669a929fd64f60e46278de46cf1b0f8f23f9fd))
- **core, integration,geo:** fix advanced map tool + map-browser-buttons placements responsability is delegated to the app ([a4c9f2c](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4c9f2c3065fe8a1c809c2613fc9ab59a0e75ee3))
- **core:** delete foreground on some theme ([#1503](https://github.com/infra-geo-ouverte/igo2-lib/issues/1503)) ([3c19a4a](https://github.com/infra-geo-ouverte/igo2-lib/commit/3c19a4a4ea4ee558198b5f1ff25f09e36416bb0d))
- **demo:** adjust path to package styles ([345f1f2](https://github.com/infra-geo-ouverte/igo2-lib/commit/345f1f217006e72d36ae23aa18b148f6e5849e32))
- **demo:** style adjustment on mobile device ([1b3d96b](https://github.com/infra-geo-ouverte/igo2-lib/commit/1b3d96b8fd38d0a1a6952a948701508c4add3c68))
- **geo/search-bar:** adjust search bar overflow on mobile ([1a7df4b](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a7df4bfe8aebfa2c8202911f9b475eff1474fc3))
- **geo:** adapt numbers with unit and solve show hide distance and area ([#1504](https://github.com/infra-geo-ouverte/igo2-lib/issues/1504)) ([09a2f0d](https://github.com/infra-geo-ouverte/igo2-lib/commit/09a2f0d364c533e5480642faa8b79fe5e61b17b7))
- **geo:** add jspdf-autotable to peer dependencies ([0cbe0b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/0cbe0b19a556e9fbc0429d2d9adc97b28e389a21))
- **geo:** build with partial compilation mode ([#1506](https://github.com/infra-geo-ouverte/igo2-lib/issues/1506)) ([838d4aa](https://github.com/infra-geo-ouverte/igo2-lib/commit/838d4aa3098b4397a6dd192d46c8849aaab575b5))
- **geo:** check manual value for mat-autocomplete and mat-datepicker ([#1518](https://github.com/infra-geo-ouverte/igo2-lib/issues/1518)) ([3a05ebf](https://github.com/infra-geo-ouverte/igo2-lib/commit/3a05ebfd5fdf9a2e19f385cc68dc347feadcfa08))
- **geo:** color picker with style modal layer ([#1523](https://github.com/infra-geo-ouverte/igo2-lib/issues/1523)) ([8c95c41](https://github.com/infra-geo-ouverte/igo2-lib/commit/8c95c414d5a2cc701ed9f2e5fd72717ba3d60539))
- **geo:** detect map print extent after change map resolution ([#1510](https://github.com/infra-geo-ouverte/igo2-lib/issues/1510)) ([34bc859](https://github.com/infra-geo-ouverte/igo2-lib/commit/34bc859157145e223298270f52b3d9065d241342))
- **geo:** eliminate 300 ppp resolution from mobile devices ([#1498](https://github.com/infra-geo-ouverte/igo2-lib/issues/1498)) ([4ed5e3e](https://github.com/infra-geo-ouverte/igo2-lib/commit/4ed5e3e8d566c227034297c6e69a7573b44decb4))
- **geo:** Layer color picker do not change the fill/stroke color ([#1509](https://github.com/infra-geo-ouverte/igo2-lib/issues/1509)) ([424214e](https://github.com/infra-geo-ouverte/igo2-lib/commit/424214e498ab1e9093569d639dd096ee3e43dba3))
- **geo:** solve export file on mobile android using uri ([#1490](https://github.com/infra-geo-ouverte/igo2-lib/issues/1490)) ([2bdbdd0](https://github.com/infra-geo-ouverte/igo2-lib/commit/2bdbdd0f16965c84e90b3e7783dae8236c79a3c2))
- **theme:** replicate the same folder structure for local / prod ([#1532](https://github.com/infra-geo-ouverte/igo2-lib/issues/1532)) ([dd74269](https://github.com/infra-geo-ouverte/igo2-lib/commit/dd742698180d375107574c9a8d0bb7a834a5a08b))

### Features

- **common:** enhance dialog components (select, checkbox, form based) ([52d7ace](https://github.com/infra-geo-ouverte/igo2-lib/commit/52d7ace57ae06f085be5dd93d8fa8418278cb775))
- **core/monitoring:** implement sentry for application monitoring ([#1341](https://github.com/infra-geo-ouverte/igo2-lib/issues/1341)) ([9992296](https://github.com/infra-geo-ouverte/igo2-lib/commit/99922967f718605d724a1e8bee68f59349ea72dd))
- **qcca-theme:** ajout de style pour la barre de défilement qc-ca ([#1400](https://github.com/infra-geo-ouverte/igo2-lib/issues/1400)) ([b8b9cba](https://github.com/infra-geo-ouverte/igo2-lib/commit/b8b9cba69633948b68b24cdb61b3412ba67ff64d))

### Reverts

- **geo:** keep compilationMode to full ([29e3265](https://github.com/infra-geo-ouverte/igo2-lib/commit/29e32654973a3e30c61353bb4be946aa3389aa3e))

## [16.0.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.0.1...v16.0.2) (2023-11-07)

### Bug Fixes

- **geo:** print - remove 300 PPI resolution ([#1489](https://github.com/infra-geo-ouverte/igo2-lib/issues/1489)) ([2f728da](https://github.com/infra-geo-ouverte/igo2-lib/commit/2f728da83036bb17e6a72a5b6f08a97e8b771d46))

## [16.0.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/v16.0.0...v16.0.1) (2023-11-06)

### Bug Fixes

- **geo:** print handle canvas with no controls ([#1488](https://github.com/infra-geo-ouverte/igo2-lib/issues/1488)) ([13c1d6c](https://github.com/infra-geo-ouverte/igo2-lib/commit/13c1d6c1207e2c2da4c5aeaddaf7fdfa2b018c72))

# [16.0.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.7...v16.0.0) (2023-11-03)

# [16.0.0-rc.7](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.6...16.0.0-rc.7) (2023-10-30)

### Reverts

- Revert "fix(context): save layer opacity in context export (#1458)" ([dae76f1](https://github.com/infra-geo-ouverte/igo2-lib/commit/dae76f155c03d45bfa511bd0b2d7180cd26fb0b3)), closes [#1458](https://github.com/infra-geo-ouverte/igo2-lib/issues/1458)

# [16.0.0-rc.6](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.5...16.0.0-rc.6) (2023-10-30)

# [16.0.0-rc.5](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.4...16.0.0-rc.5) (2023-10-30)

### Bug Fixes

- **common:** interactive-tour add the auto placement ([#1457](https://github.com/infra-geo-ouverte/igo2-lib/issues/1457)) ([0087ace](https://github.com/infra-geo-ouverte/igo2-lib/commit/0087acec34f3cc9c015dbe10a35124a6528d3c14))
- **context:** context-permissions style regression ([#1462](https://github.com/infra-geo-ouverte/igo2-lib/issues/1462)) ([975fc6d](https://github.com/infra-geo-ouverte/igo2-lib/commit/975fc6dc0aa7981a43a25eeb8c633e2fab096c9f))
- **context:** poi-button style regression ([#1470](https://github.com/infra-geo-ouverte/igo2-lib/issues/1470)) ([85d1331](https://github.com/infra-geo-ouverte/igo2-lib/commit/85d13310d0586bf3eda8566bad3b3186dbd84ba4))
- **context:** save layer opacity in context export ([#1458](https://github.com/infra-geo-ouverte/igo2-lib/issues/1458)) ([168ab6b](https://github.com/infra-geo-ouverte/igo2-lib/commit/168ab6bc5a985a24adaa4e90b79f0a14d0d2e4e0))
- **context:** style regression for the menu ([#1468](https://github.com/infra-geo-ouverte/igo2-lib/issues/1468)) ([13cb3e7](https://github.com/infra-geo-ouverte/igo2-lib/commit/13cb3e7b4f3e8951845f15738d39162a61505c68))
- **context:** trigger the changes on empty result ([#1471](https://github.com/infra-geo-ouverte/igo2-lib/issues/1471)) ([18aebca](https://github.com/infra-geo-ouverte/igo2-lib/commit/18aebca48d08f8e6b3b5422bcac32de2d1159e3d))
- **core:** adjust typography ([#1466](https://github.com/infra-geo-ouverte/igo2-lib/issues/1466)) ([b8885c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/b8885c6eff2d9fd183f440062491fde98c158ceb))
- **geo:** layer - visibility button style regression ([#1456](https://github.com/infra-geo-ouverte/igo2-lib/issues/1456)) ([9221c04](https://github.com/infra-geo-ouverte/igo2-lib/commit/9221c04ba49f678ea222e2ff68ee7f748e0d863d))
- **geo:** store strategy in-map-extent revert changes ([54027da](https://github.com/infra-geo-ouverte/igo2-lib/commit/54027dad0d769096205e7c41779376f14f894bbf))

### Features

- **geo:** add a error message on fail during data download ([#1464](https://github.com/infra-geo-ouverte/igo2-lib/issues/1464)) ([6673979](https://github.com/infra-geo-ouverte/igo2-lib/commit/6673979c6fbf9aac6e6f86a2b9a990b80bbfd009))

# [16.0.0-rc.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.3...16.0.0-rc.4) (2023-10-18)

### Bug Fixes

- **core:** typography - adjust some size regression ([#1451](https://github.com/infra-geo-ouverte/igo2-lib/issues/1451)) ([cfd6f73](https://github.com/infra-geo-ouverte/igo2-lib/commit/cfd6f739bde36444ae351f864be4e7c44212b862))
- **geo:** style regression with the material theme ([#1452](https://github.com/infra-geo-ouverte/igo2-lib/issues/1452)) ([7cad71a](https://github.com/infra-geo-ouverte/igo2-lib/commit/7cad71ad62977670674154732def6389e3d1d52e))

### Features

- **geo:** ilayer - add the showAdvancedSettings ([#1453](https://github.com/infra-geo-ouverte/igo2-lib/issues/1453)) ([a72e03b](https://github.com/infra-geo-ouverte/igo2-lib/commit/a72e03b32bff5e47f435b9f20fae74b1d2f1ea9a))

# [16.0.0-rc.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.2...16.0.0-rc.3) (2023-10-13)

### Bug Fixes

- **geo:** fix homeExtentButtonOptions ([#1442](https://github.com/infra-geo-ouverte/igo2-lib/issues/1442)) ([c431663](https://github.com/infra-geo-ouverte/igo2-lib/commit/c4316635a86d63cf29c67249a19e7c31f3cfa78f))
- **ogcFilter:** v16 regression, let the button being clickable when header=false ([#1444](https://github.com/infra-geo-ouverte/igo2-lib/issues/1444)) ([f7f82dd](https://github.com/infra-geo-ouverte/igo2-lib/commit/f7f82dd883cfcbb86b865b5f2cbd13b45101a4ab))

### Features

- **context:** save layer opacity in when creating context from map ([#1439](https://github.com/infra-geo-ouverte/igo2-lib/issues/1439)) ([cc2669d](https://github.com/infra-geo-ouverte/igo2-lib/commit/cc2669dd0885c5958d6b60307aae7c38bccf461c))

# [16.0.0-rc.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.1...16.0.0-rc.2) (2023-10-11)

### Bug Fixes

- **Core:** resolve infinite loop between MessageService and the ErrorInterceptor ([#1419](https://github.com/infra-geo-ouverte/igo2-lib/issues/1419)) ([bc0da58](https://github.com/infra-geo-ouverte/igo2-lib/commit/bc0da58f1b90a4d785fd0b5c0c4c950eb29f63ee))
- **EditionWorkspace:** pass the service context to the function parameter ([#1415](https://github.com/infra-geo-ouverte/igo2-lib/issues/1415)) ([111f851](https://github.com/infra-geo-ouverte/igo2-lib/commit/111f8514052cb0ebaab2bb392b9dfbe690feb6ac))
- **geo, common:** Integrate ngx color ([#1422](https://github.com/infra-geo-ouverte/igo2-lib/issues/1422)) ([e920a41](https://github.com/infra-geo-ouverte/igo2-lib/commit/e920a413f72916af1f59a9c4faf889450faf436d))
- **MDC:** resolve all remaining TODO from MDC migration ([#1416](https://github.com/infra-geo-ouverte/igo2-lib/issues/1416)) ([dc0815e](https://github.com/infra-geo-ouverte/igo2-lib/commit/dc0815ebaa9d95f0d303e575981c395e22d3af07))
- **MessageService:** handle number for field validation message ([#1432](https://github.com/infra-geo-ouverte/igo2-lib/issues/1432)) ([e6eaa28](https://github.com/infra-geo-ouverte/igo2-lib/commit/e6eaa2829863bbcefeb9b42e0204b0033e5d6293))

### Features

- add types for app environment and config ([3b75824](https://github.com/infra-geo-ouverte/igo2-lib/commit/3b75824a1c7273776c68621826a6658121859e03)), closes [#1430](https://github.com/infra-geo-ouverte/igo2-lib/issues/1430)
- **core:** add default value param to the getConfig method ([#1434](https://github.com/infra-geo-ouverte/igo2-lib/issues/1434)) ([8a24b6f](https://github.com/infra-geo-ouverte/igo2-lib/commit/8a24b6f89da6eb76af2bc625029d3b359f3f2eaf))
- **core:** add method to retrieve global configs ([#1417](https://github.com/infra-geo-ouverte/igo2-lib/issues/1417)) ([05454b9](https://github.com/infra-geo-ouverte/igo2-lib/commit/05454b9105ec0d1dbe7ffd55701a8c2138984d8a))

### Performance Improvements

- **wfs:** cancel outgoing wfs xhr on pan/zoom ([#1421](https://github.com/infra-geo-ouverte/igo2-lib/issues/1421)) ([b796cec](https://github.com/infra-geo-ouverte/igo2-lib/commit/b796cec28417bc4d30a7ad5787b6c07f09f2bc3b))

# [16.0.0-rc.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/16.0.0-rc.0...16.0.0-rc.1) (2023-09-22)

### Bug Fixes

- **InteractiveTour:** add Placement types from [@floating-ui](https://github.com/floating-ui) ([#1407](https://github.com/infra-geo-ouverte/igo2-lib/issues/1407)) ([44b3d4a](https://github.com/infra-geo-ouverte/igo2-lib/commit/44b3d4ac88a23a83bc4704dde03a563230b90c53))
- **InteractiveTour:** options migration from popperJS to floatingUI ([#1399](https://github.com/infra-geo-ouverte/igo2-lib/issues/1399)) ([fbc4ff7](https://github.com/infra-geo-ouverte/igo2-lib/commit/fbc4ff7a26f501c8d42e28760440d4b45b99cbc6))
- **menu-button:** fix v16.0.0 regression form menu button color configuration ([#1403](https://github.com/infra-geo-ouverte/igo2-lib/issues/1403)) ([c92b488](https://github.com/infra-geo-ouverte/igo2-lib/commit/c92b488dcae1329e82e0c42274c0fed49cae5c70))
- **Openlayers:** downgrade to 7.5.2 due to wms regression ([#1402](https://github.com/infra-geo-ouverte/igo2-lib/issues/1402)) ([a18905a](https://github.com/infra-geo-ouverte/igo2-lib/commit/a18905a57be9ea0ce120a50caf395b14f8a4cebc))

### Features

- **core:** add a new method to handle deprecated configs ([#1408](https://github.com/infra-geo-ouverte/igo2-lib/issues/1408)) ([8019300](https://github.com/infra-geo-ouverte/igo2-lib/commit/801930010a15696eb201401150c94d46591d6884))
- **direction:** add a toogle to control user interaction with map ([#1396](https://github.com/infra-geo-ouverte/igo2-lib/issues/1396)) ([cdea457](https://github.com/infra-geo-ouverte/igo2-lib/commit/cdea45704ef2c347eeae3800e3be3b534dfe9a1e))
- **Prettier:** be specific about the end of line ([a4be26e](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4be26ebbef5afe81e3e588fa99b2be77c26a3d4))
- **qcca-theme:** ajout de style pour la barre de défilement qc-ca ([#1400](https://github.com/infra-geo-ouverte/igo2-lib/issues/1400)) ([8d00c6b](https://github.com/infra-geo-ouverte/igo2-lib/commit/8d00c6b5b94ae8ee1f06fb1c2d5e4f582280deee))

# [16.0.0-rc.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.15.2...16.0.0-rc.0) (2023-09-19)

### Bug Fixes

- **catalog-library-item:** icon placement for external providers ([4b02550](https://github.com/infra-geo-ouverte/igo2-lib/commit/4b0255060405b8854c4686c07eac351aa4f759e8))
- **catalog:** Composite catalog initialisation ([a6c6941](https://github.com/infra-geo-ouverte/igo2-lib/commit/a6c6941a52a71163c89086745a9a08826808f8cb))
- **ColorPicker:** remove unused deps ([#1394](https://github.com/infra-geo-ouverte/igo2-lib/issues/1394)) ([545f291](https://github.com/infra-geo-ouverte/igo2-lib/commit/545f291de18c09ea9a375ed92cb2ef57bb2c43e3))
- **directions:** padding for steps text ([a3b09a4](https://github.com/infra-geo-ouverte/igo2-lib/commit/a3b09a47dd9061d23af3071cb44fcad4b1dcfc8d))
- **draw:** drawing circle crash whole drawing component. ([#1273](https://github.com/infra-geo-ouverte/igo2-lib/issues/1273)) ([3998dcc](https://github.com/infra-geo-ouverte/igo2-lib/commit/3998dccb9007a5fb4a2a98be492cca428417b5a0))
- **EntityStore:** add strategy variant ([d28e9f3](https://github.com/infra-geo-ouverte/igo2-lib/commit/d28e9f39e35e9434920e254c1570bf89c978d545))
- **EntityTable:** validate octal number ([#1293](https://github.com/infra-geo-ouverte/igo2-lib/issues/1293)) ([860ea7e](https://github.com/infra-geo-ouverte/igo2-lib/commit/860ea7ea773af1f6eb4796ef8d47b446e4bd1cc5))
- **feature:** exported context with draw - radius is kept on context import ([#1380](https://github.com/infra-geo-ouverte/igo2-lib/issues/1380)) ([bf9ac19](https://github.com/infra-geo-ouverte/igo2-lib/commit/bf9ac19cd16adc95e17df7af86d942c30701cbba))
- **geo,common:** create new color picker component ([#1368](https://github.com/infra-geo-ouverte/igo2-lib/issues/1368)) ([169379c](https://github.com/infra-geo-ouverte/igo2-lib/commit/169379ced1eaf30f98a60940670d1fb994207759))
- **geo:** delete map legend after the printing from the DOM ([#1304](https://github.com/infra-geo-ouverte/igo2-lib/issues/1304)) ([d84a9e6](https://github.com/infra-geo-ouverte/igo2-lib/commit/d84a9e6608c08da02a7068a19542fa302b690073))
- **geo:** google map links were not interpreted on mobile ([#1388](https://github.com/infra-geo-ouverte/igo2-lib/issues/1388)) ([a4da9c5](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4da9c520a02a1863194fc31679fe5646defdbe4))
- **geo:** Print without cursor position ([#1265](https://github.com/infra-geo-ouverte/igo2-lib/issues/1265)) ([e5592f8](https://github.com/infra-geo-ouverte/igo2-lib/commit/e5592f82636d57d591cc39898c278ee3374cdbdd))
- https://github.com/angular/components/issues/27035 ([426204e](https://github.com/infra-geo-ouverte/igo2-lib/commit/426204e8b628a0c117d6e9d25c31ae6f7904b43c))
- **ICherche:** add a custom cache hash to account for http params ([#1262](https://github.com/infra-geo-ouverte/igo2-lib/issues/1262)) ([776fc4b](https://github.com/infra-geo-ouverte/igo2-lib/commit/776fc4b0de39ab4b098d0872fb0991776ed2a503)), closes [infra-geo-ouverte/igo2#928](https://github.com/infra-geo-ouverte/igo2/issues/928)
- **integration:** import Action interface and add DatePipe in demo app.module to solve datepipe issue ([#1300](https://github.com/infra-geo-ouverte/igo2-lib/issues/1300)) ([459ee89](https://github.com/infra-geo-ouverte/igo2-lib/commit/459ee8939f474622a17cc8665133adf10f80397a))
- **layer-list:** list on mobile was on 2 rows ([e3c825e](https://github.com/infra-geo-ouverte/igo2-lib/commit/e3c825e17b3822def32066dfdc8166ae020f7cc2))
- **LayerContext:** subscribe once with first operator ([#1272](https://github.com/infra-geo-ouverte/igo2-lib/issues/1272)) ([b83ec47](https://github.com/infra-geo-ouverte/igo2-lib/commit/b83ec47f120153df05c36da19e60e96102066e0c)), closes [#1271](https://github.com/infra-geo-ouverte/igo2-lib/issues/1271)
- **pointer-summary:** error due layer creation when map is not ready ([87239f6](https://github.com/infra-geo-ouverte/igo2-lib/commit/87239f6b11cba16b97bea354482645e05edd9ef6))
- **regex:** missing regexes for geoservice ([4bda3ce](https://github.com/infra-geo-ouverte/igo2-lib/commit/4bda3cebdf6e7f81fa24915f29e35b0efdf3a726))
- **toggle buttons:** labels were before the toggle ([c87cb1f](https://github.com/infra-geo-ouverte/igo2-lib/commit/c87cb1faae444fa015f7176c81dc42221384c073))

### Features

- **context:** import export context in demo ([#1348](https://github.com/infra-geo-ouverte/igo2-lib/issues/1348)) ([41cfaa6](https://github.com/infra-geo-ouverte/igo2-lib/commit/41cfaa6b8a0f2bf0afde140ad483f5789ae770c3))
- **context:** save layer opacity if export context ([#1322](https://github.com/infra-geo-ouverte/igo2-lib/issues/1322)) ([cdcfc9d](https://github.com/infra-geo-ouverte/igo2-lib/commit/cdcfc9d107c6c6996162b85502b70e1b67f4a2fb))
- **context:** set map zoom level after importing context ([#1384](https://github.com/infra-geo-ouverte/igo2-lib/issues/1384)) ([c1a1491](https://github.com/infra-geo-ouverte/igo2-lib/commit/c1a1491a3a647fa6ce9db039f7789c4d222a4e1b))
- **Debug:** add launch to debug in vscode with breakpoints ([#1299](https://github.com/infra-geo-ouverte/igo2-lib/issues/1299)) ([2ec8376](https://github.com/infra-geo-ouverte/igo2-lib/commit/2ec83760358ac1d38e67a76a419d4cdee7a2552d))
- **geo:** add print route directions function ([#1289](https://github.com/infra-geo-ouverte/igo2-lib/issues/1289)) ([63a7435](https://github.com/infra-geo-ouverte/igo2-lib/commit/63a7435358bc278336341418135d36efc276b471))
- **geo:** Added rotate option and north direction to the map when pr… ([#1256](https://github.com/infra-geo-ouverte/igo2-lib/issues/1256)) ([b79c7a0](https://github.com/infra-geo-ouverte/igo2-lib/commit/b79c7a012f2e95b12758a15116577c2a6f27337f))
- **geo:** Print with resolution PDF and image ([#1264](https://github.com/infra-geo-ouverte/igo2-lib/issues/1264)) ([f492050](https://github.com/infra-geo-ouverte/igo2-lib/commit/f4920504e5190835312bfa3e4630aeac39da6047))
- **iCherche:** add a config to hide advanced options ([#1386](https://github.com/infra-geo-ouverte/igo2-lib/issues/1386)) ([0fee36e](https://github.com/infra-geo-ouverte/igo2-lib/commit/0fee36eb34e64855ed4d10852286f8279b5225e2))
- **SplashScreen:** add a replaceable image ([#1381](https://github.com/infra-geo-ouverte/igo2-lib/issues/1381)) ([1bc4bc7](https://github.com/infra-geo-ouverte/igo2-lib/commit/1bc4bc7798b484595ae9d0729fce0014a0a32d7a))
- **workspace:** can now detect geoservice properties (wms...) to add/remove layer from workspace ([f49984f](https://github.com/infra-geo-ouverte/igo2-lib/commit/f49984ff80a3d069fa625f31c9a46c64254780d0))
- **workspace:** workspaces table view are now printable ([#1291](https://github.com/infra-geo-ouverte/igo2-lib/issues/1291)) ([1b62cd4](https://github.com/infra-geo-ouverte/igo2-lib/commit/1b62cd48561682912738d88f3d60d030527fe4d2))

## [1.15.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.15.1...1.15.2) (2023-05-16)

## [1.15.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.15.0...1.15.1) (2023-05-05)

### Bug Fixes

- **map-tools:** error on some layer deletion ([bae5f0f](https://github.com/infra-geo-ouverte/igo2-lib/commit/bae5f0fcdb96064429ec528c66e78524f64d7fe1))
- **searchOptions:** show options for mobile ([#1237](https://github.com/infra-geo-ouverte/igo2-lib/issues/1237)) ([a9d0836](https://github.com/infra-geo-ouverte/igo2-lib/commit/a9d0836f2af79aad0f913291120d8eda01ef5754))
- **vector-layer:** stored layer can now be searchable on app reload ([7a3c717](https://github.com/infra-geo-ouverte/igo2-lib/commit/7a3c7179eda5dff85407a13a4d04caf7f180ac22))

# [1.15.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.14.2...1.15.0) (2023-05-03)

### Bug Fixes

- **catalog:** error message on catalog crash ([e2d72e4](https://github.com/infra-geo-ouverte/igo2-lib/commit/e2d72e4eecaa13b173ab261ab98ef428de9e32f0))
- **ConfigFileToGeoDBService:** date parsing was wrong on iOS ([7d2c7e0](https://github.com/infra-geo-ouverte/igo2-lib/commit/7d2c7e0f833c4641371893ba9f3a4f74adc766e3))
- **core:** Missing languageService randomly occur ([#1223](https://github.com/infra-geo-ouverte/igo2-lib/issues/1223)) ([80e090d](https://github.com/infra-geo-ouverte/igo2-lib/commit/80e090da860cd00eed6dfad33f2dbe92de2fedc9))
- **datasource:** prevent service request when offline ([#1226](https://github.com/infra-geo-ouverte/igo2-lib/issues/1226)) ([1d44c5c](https://github.com/infra-geo-ouverte/igo2-lib/commit/1d44c5c327cc268e271f1c5c20804cc4363f3122))
- **demo:** fix error due to style refactor ([086c1d7](https://github.com/infra-geo-ouverte/igo2-lib/commit/086c1d7a5841956b9b8501e18e7bf0cca20b4553))
- **draw:** error with layers with numeric id ([#1195](https://github.com/infra-geo-ouverte/igo2-lib/issues/1195)) ([327e5d3](https://github.com/infra-geo-ouverte/igo2-lib/commit/327e5d3f9b7061c563d140a8c89170543543707e))
- **drawing guide:** Fix a regression to the drawing guide that wasn't working with certain draw style definition ([#1201](https://github.com/infra-geo-ouverte/igo2-lib/issues/1201)) ([7bfb646](https://github.com/infra-geo-ouverte/igo2-lib/commit/7bfb646b04b5b37bd55f16f12ff3a189719779e9))
- **export:** export formats were wrong if allowed formats were imposed in config ([#1221](https://github.com/infra-geo-ouverte/igo2-lib/issues/1221)) ([566d0f4](https://github.com/infra-geo-ouverte/igo2-lib/commit/566d0f450469d3185fcf86361a8d4eecce73e731))
- **geo, integration:** solve bug - save search results in new layer aft… ([#1229](https://github.com/infra-geo-ouverte/igo2-lib/issues/1229)) ([f7f55dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/f7f55dc63b09b2983116e89cc2f8647080e244a4))
- **geo, integration:** solve config bug save search result in layer ([#1222](https://github.com/infra-geo-ouverte/igo2-lib/issues/1222)) ([dab8166](https://github.com/infra-geo-ouverte/igo2-lib/commit/dab8166067ddf963a787ccd4b2b1a3c8dd2e0d42))
- **geo:** add attribution and copyright if export pdf or image ([#1215](https://github.com/infra-geo-ouverte/igo2-lib/issues/1215)) ([25da649](https://github.com/infra-geo-ouverte/igo2-lib/commit/25da6493056b45e63eba05917082338a99211ddd))
- **geo:** export map and legend in the same file zip ([#1212](https://github.com/infra-geo-ouverte/igo2-lib/issues/1212)) ([f8bd55b](https://github.com/infra-geo-ouverte/igo2-lib/commit/f8bd55ba50413ef386f68a8fe535fb9a4bbf413e))
- **longpress:** prevent multitouch event emissioon ([#1205](https://github.com/infra-geo-ouverte/igo2-lib/issues/1205)) ([4b89f11](https://github.com/infra-geo-ouverte/igo2-lib/commit/4b89f11296b1020531ddebeed388f2ddc5da5f51))
- **search-results-add-button:** error with layers with numeric id ([331d998](https://github.com/infra-geo-ouverte/igo2-lib/commit/331d99825dcfa99d64e0e1ef980ebabd392ce5a7))
- **translations:** missing interpolated value ([f7bc3d8](https://github.com/infra-geo-ouverte/igo2-lib/commit/f7bc3d8e32c0ed2839ebfd181fc7f89513a803e9))
- **zippedGeojson:** fix utf8 encoding error ([#1217](https://github.com/infra-geo-ouverte/igo2-lib/issues/1217)) ([fce88f7](https://github.com/infra-geo-ouverte/igo2-lib/commit/fce88f72cb4f65694aabaae27c0eeaf50df5628c))

### Features

- **confirm-dialog:** now support translations ([#1203](https://github.com/infra-geo-ouverte/igo2-lib/issues/1203)) ([3171e3f](https://github.com/infra-geo-ouverte/igo2-lib/commit/3171e3faf69ca7008536584fc729bd65c45de76e))
- **feature-datasource:** add a preload options on vector source ([#1231](https://github.com/infra-geo-ouverte/igo2-lib/issues/1231)) ([c303d57](https://github.com/infra-geo-ouverte/igo2-lib/commit/c303d5740559cbd614514bdd2e200a8b6925d4c3))
- **geo:** add splitTextToSize to optimise long comment on more lines ([#1193](https://github.com/infra-geo-ouverte/igo2-lib/issues/1193)) ([b6b77b9](https://github.com/infra-geo-ouverte/igo2-lib/commit/b6b77b98b2296ab177873c3d13b394597e6230ec))
- **geo:** add style and change color in feature store ([#1228](https://github.com/infra-geo-ouverte/igo2-lib/issues/1228)) ([ce14056](https://github.com/infra-geo-ouverte/igo2-lib/commit/ce14056587a4db8836c1c4c76c8363c2c403863c))
- **geo:** allow query results to show results as tab instead of a list ([#1156](https://github.com/infra-geo-ouverte/igo2-lib/issues/1156)) ([1a79c2d](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a79c2d6c2ddfc72b72af2fbd4a6f5b2e6dde228))
- **geolocation:** better handling view zoom/move + show movement direction ([#1209](https://github.com/infra-geo-ouverte/igo2-lib/issues/1209)) ([7e82ee4](https://github.com/infra-geo-ouverte/igo2-lib/commit/7e82ee4a4b9b55861295389cff26b3cb72d6d592))
- **geo:** Show add results icon only when hovering over the result ([#1230](https://github.com/infra-geo-ouverte/igo2-lib/issues/1230)) ([bdd304a](https://github.com/infra-geo-ouverte/igo2-lib/commit/bdd304a4d378692df2a08e263b994b7bd7b7cbc5))
- **imported vector:** allow to store vector data and layer in indexeddb ([#1204](https://github.com/infra-geo-ouverte/igo2-lib/issues/1204)) ([7862664](https://github.com/infra-geo-ouverte/igo2-lib/commit/7862664e077ebef187ce4f016b209d8de3d5f1b2))
- **indexeddb:** adding a store to save layers ([#1198](https://github.com/infra-geo-ouverte/igo2-lib/issues/1198)) ([ebe27b7](https://github.com/infra-geo-ouverte/igo2-lib/commit/ebe27b7eda8ef1bfb38c9bfd4057dd019448b344))
- **integration:** Make the save search result option configurable ([#1206](https://github.com/infra-geo-ouverte/igo2-lib/issues/1206)) ([ebb3f21](https://github.com/infra-geo-ouverte/igo2-lib/commit/ebb3f21203925c14fbc2e50b00d0392acec08c8f))
- **map-proximity:** keep radius distance into storage ([#1216](https://github.com/infra-geo-ouverte/igo2-lib/issues/1216)) ([ee63921](https://github.com/infra-geo-ouverte/igo2-lib/commit/ee639216ff704317e49bd31d8b2fc8c51913fc59))
- **search:** search within imported data or vector data ([#1185](https://github.com/infra-geo-ouverte/igo2-lib/issues/1185)) ([8f5889f](https://github.com/infra-geo-ouverte/igo2-lib/commit/8f5889fb41f9eec7d2607bc8053e58376e3b4673))

### Reverts

- **mapOffline:** partial revert for language service linked to message service. ([#1210](https://github.com/infra-geo-ouverte/igo2-lib/issues/1210)) ([21e29e9](https://github.com/infra-geo-ouverte/igo2-lib/commit/21e29e99ccbe64a940d4709601d4a32cc38b4623))

## [1.14.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.14.1...1.14.2) (2023-03-15)

### Bug Fixes

- **context:** crash on context export with vector data ([#1188](https://github.com/infra-geo-ouverte/igo2-lib/issues/1188)) ([7e8054b](https://github.com/infra-geo-ouverte/igo2-lib/commit/7e8054b04a3aa6abfccbeb0210b827e0544e5967))
- **demo:** unable to add layers from the catalog ([#1186](https://github.com/infra-geo-ouverte/igo2-lib/issues/1186)) ([bdde58c](https://github.com/infra-geo-ouverte/igo2-lib/commit/bdde58c8c9eb2a5e15c1bdba1484e878cea5b2ee))
- **geo:** solve absence of legend when printing an image ([#1191](https://github.com/infra-geo-ouverte/igo2-lib/issues/1191)) ([0a4f3f3](https://github.com/infra-geo-ouverte/igo2-lib/commit/0a4f3f3b0dc58c766efe8ce77e1c05a0070442ef))
- **minmap:** fix minimap view change ([#1178](https://github.com/infra-geo-ouverte/igo2-lib/issues/1178)) ([5da63de](https://github.com/infra-geo-ouverte/igo2-lib/commit/5da63de0b1f33af51c541b146c7db973b4e17478))
- **search-source:** fix language reload on search source ([#1189](https://github.com/infra-geo-ouverte/igo2-lib/issues/1189)) ([46924d2](https://github.com/infra-geo-ouverte/igo2-lib/commit/46924d222760e9440034d3aa3f72a7fd0c832c0d))

### Features

- **geo:** add new option to reverse long lat coord ([#1159](https://github.com/infra-geo-ouverte/igo2-lib/issues/1159)) ([a3ef8b8](https://github.com/infra-geo-ouverte/igo2-lib/commit/a3ef8b826905cce3a4930d99766d7271433e82aa))
- **geo:** save search results in layer ([#1179](https://github.com/infra-geo-ouverte/igo2-lib/issues/1179)) ([a0d727b](https://github.com/infra-geo-ouverte/igo2-lib/commit/a0d727b49b269941f214a61a3dfc3957ca4d5313))
- **geo:** update queryUrl with min max resolution ([#1167](https://github.com/infra-geo-ouverte/igo2-lib/issues/1167)) ([5b2cf96](https://github.com/infra-geo-ouverte/igo2-lib/commit/5b2cf964c465bc933c4f63b39d6896115c1c44c8))
- **regexService:** config define regex list/object ([#1125](https://github.com/infra-geo-ouverte/igo2-lib/issues/1125)) ([1199e18](https://github.com/infra-geo-ouverte/igo2-lib/commit/1199e1873020a677c6e52a3f6209b48f2a530e21))
- **search/catalog:** add visible/non-visible badge icon on layers ([#1184](https://github.com/infra-geo-ouverte/igo2-lib/issues/1184)) ([b4f130d](https://github.com/infra-geo-ouverte/igo2-lib/commit/b4f130d8b956acdc8a8a7d0f0ec8393c4e1418d9))

## [1.14.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.14.0...1.14.1) (2023-01-25)

### Bug Fixes

- **draw:** drawlayer zoom to extent ([#1161](https://github.com/infra-geo-ouverte/igo2-lib/issues/1161)) ([78664b2](https://github.com/infra-geo-ouverte/igo2-lib/commit/78664b25df0fcbc7df891fff7df7fd5b44c4effd))
- **mapOfflineDirective:** keep layer's maxResolution on online/offline toggle ([#1166](https://github.com/infra-geo-ouverte/igo2-lib/issues/1166)) ([1a5f238](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a5f2387f49bca6a31f8cb7cb0e17407c01d7ecf))
- **ogc-filter-time:** fix calendar select date function ([#1153](https://github.com/infra-geo-ouverte/igo2-lib/issues/1153)) ([2b444ca](https://github.com/infra-geo-ouverte/igo2-lib/commit/2b444ca875b1555f180811dc04e5c83352f2c0fd))
- **print:** bug in geopdf with projection string ([#1160](https://github.com/infra-geo-ouverte/igo2-lib/issues/1160)) ([50e2b4c](https://github.com/infra-geo-ouverte/igo2-lib/commit/50e2b4cf42cdd919706dd8e050700eed64ddc05c))
- **query:** fix query url bbox param ([#1169](https://github.com/infra-geo-ouverte/igo2-lib/issues/1169)) ([94481a9](https://github.com/infra-geo-ouverte/igo2-lib/commit/94481a965f6a8075d501eb5566756e72d43ed207))
- **search-result:** allow more results on a filtered state ([#1171](https://github.com/infra-geo-ouverte/igo2-lib/issues/1171)) ([7d2dea3](https://github.com/infra-geo-ouverte/igo2-lib/commit/7d2dea3f6e9a84db06f8d8e1ae9a10875788d15d))
- **search-results:** hide empty result during typing ([#1154](https://github.com/infra-geo-ouverte/igo2-lib/issues/1154)) ([10cee3c](https://github.com/infra-geo-ouverte/igo2-lib/commit/10cee3cff38a18df6a177ac2cdb971f4305d0874))

### Features

- delete column geom32198 on query or feature conversion to search result ([#1165](https://github.com/infra-geo-ouverte/igo2-lib/issues/1165)) ([c015744](https://github.com/infra-geo-ouverte/igo2-lib/commit/c01574495348591bfb3e36447a4250600947420a))
- **icherche:** add bike and road rest areas([#1163](https://github.com/infra-geo-ouverte/igo2-lib/issues/1163)) ([b615d50](https://github.com/infra-geo-ouverte/igo2-lib/commit/b615d50ee8cfec13b16089e47713c8ff3da6ed5b))
- **search-results:** Remove the number of results [#829](https://github.com/infra-geo-ouverte/igo2-lib/issues/829) ([#1157](https://github.com/infra-geo-ouverte/igo2-lib/issues/1157)) based on config ([f20e344](https://github.com/infra-geo-ouverte/igo2-lib/commit/f20e3442527221b118c23ef1edaa6a8c98935c84))

### Performance Improvements

- **integration:** add click action on igo-panel-title to show location details ([#1148](https://github.com/infra-geo-ouverte/igo2-lib/issues/1148)) ([23b4982](https://github.com/infra-geo-ouverte/igo2-lib/commit/23b4982a0e6fb0c6e60c873bc409e9b825424054))

# [1.14.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.13.4...1.14.0) (2022-12-15)

### Bug Fixes

- **app:** fix mat-icon suffix css ([#1139](https://github.com/infra-geo-ouverte/igo2-lib/issues/1139)) ([afae52e](https://github.com/infra-geo-ouverte/igo2-lib/commit/afae52e4b59e3ee1b815411c166f36d159ba6d5e))
- **export:** layer names with ’ cause export crash (ogre). ([#1146](https://github.com/infra-geo-ouverte/igo2-lib/issues/1146)) ([f9e0551](https://github.com/infra-geo-ouverte/igo2-lib/commit/f9e05515c456cc5732581029122fc0eab2c176e3))
- **hover:** different view projection cause app crash due to vector tile definition ([e1a0a93](https://github.com/infra-geo-ouverte/igo2-lib/commit/e1a0a93d7329197ff0a8efb5875d829388552e94))
- **query:** don't show message when feature count is 1 or less ([#1141](https://github.com/infra-geo-ouverte/igo2-lib/issues/1141)) ([74dc55d](https://github.com/infra-geo-ouverte/igo2-lib/commit/74dc55dce93a1d97340fdd85a4e72af0da5c2c42))
- **query:** undefined geometry handling ([#1143](https://github.com/infra-geo-ouverte/igo2-lib/issues/1143)) ([74c18d4](https://github.com/infra-geo-ouverte/igo2-lib/commit/74c18d4a964f5c065d340a097bca4e2065418231))

### Features

- **auth:** allow language force to bypass user locale ([#1147](https://github.com/infra-geo-ouverte/igo2-lib/issues/1147)) ([52ab2c9](https://github.com/infra-geo-ouverte/igo2-lib/commit/52ab2c9fa7c700bae29411819b7580b1ef152335))
- **ConfigFileToGeoDBService:** using zipped geojson ([#1140](https://github.com/infra-geo-ouverte/igo2-lib/issues/1140)) ([8c7dc93](https://github.com/infra-geo-ouverte/igo2-lib/commit/8c7dc93e750cb5ec9328a449e4e4a1c53d971d25))
- **draw:** added possibility to use a predefined radius when drawing circle in drawing tool ([#1090](https://github.com/infra-geo-ouverte/igo2-lib/issues/1090)) ([4a93c0d](https://github.com/infra-geo-ouverte/igo2-lib/commit/4a93c0d3aae8fdd768b312c7a7c716c404a7543e))
- **draw:** Drawing coordinate label and predefined values (area,length,perimeter)([#1092](https://github.com/infra-geo-ouverte/igo2-lib/issues/1092)) ([f9e3fe0](https://github.com/infra-geo-ouverte/igo2-lib/commit/f9e3fe0d14a1c80f0a8139880de7f9b25ba4e667))
- **import:** controls for import formats ([#1144](https://github.com/infra-geo-ouverte/igo2-lib/issues/1144)) ([13ed654](https://github.com/infra-geo-ouverte/igo2-lib/commit/13ed6543789d4f5e9d7ae568f0169118345c21c1))
- **layer & catalog:** provide interface to handle profils on layer (auth) ([#1109](https://github.com/infra-geo-ouverte/igo2-lib/issues/1109)) ([f00532f](https://github.com/infra-geo-ouverte/igo2-lib/commit/f00532f95d1504e4156b56ebf8bb95a4189b19e5))
- **print:** print make georeferenced PDF ([#1149](https://github.com/infra-geo-ouverte/igo2-lib/issues/1149)) ([7b3eeb6](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b3eeb65696c70be367e75a22672a6de83f9627e))

## [1.13.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.13.3...1.13.4) (2022-11-22)

### Bug Fixes

- **contexts:** fix empty context list when ours is empty ([#1137](https://github.com/infra-geo-ouverte/igo2-lib/issues/1137)) ([cd8b830](https://github.com/infra-geo-ouverte/igo2-lib/commit/cd8b830063095fde3fe78e8ed352bfb24a497b38))
- **imgerror:** relative path is used ([#1135](https://github.com/infra-geo-ouverte/igo2-lib/issues/1135)) ([4fe3918](https://github.com/infra-geo-ouverte/igo2-lib/commit/4fe3918490e3dab7d0f68bada832b708b0909f3b))

## [1.13.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.13.2...1.13.3) (2022-11-16)

### Bug Fixes

- **layer-sync/feature-details:** layer sync filters init / embedded link ([#1132](https://github.com/infra-geo-ouverte/igo2-lib/issues/1132)) ([a8c911f](https://github.com/infra-geo-ouverte/igo2-lib/commit/a8c911f880567b7caa9e0d9331cdb34c39fba085))

### Features

- **draw:** Make multiple layers with the drawing tool ([#1081](https://github.com/infra-geo-ouverte/igo2-lib/issues/1081)) ([39179bb](https://github.com/infra-geo-ouverte/igo2-lib/commit/39179bbd57d797821c882041453152ced5c4a83c))

## [1.13.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.13.1...1.13.2) (2022-11-14)

### Bug Fixes

- **chore:** fix gh pages build ([b979713](https://github.com/infra-geo-ouverte/igo2-lib/commit/b979713290168691b649b08d4c0f7b73f37b5fce))
- **googleLinks:** links were broken ([#1130](https://github.com/infra-geo-ouverte/igo2-lib/issues/1130)) ([b3e15b0](https://github.com/infra-geo-ouverte/igo2-lib/commit/b3e15b0da8e7ee83024278ca41405e0a97c29064))
- **hover:** fix flashing feature and property transfer ([#1129](https://github.com/infra-geo-ouverte/igo2-lib/issues/1129)) ([f9b38fd](https://github.com/infra-geo-ouverte/igo2-lib/commit/f9b38fd572fd3a7cf63e74ed54aea9c1c819bf9a))

### Features

- **geoDB:** service to load data from config file into the indexed-db ([#1115](https://github.com/infra-geo-ouverte/igo2-lib/issues/1115)) ([a8f866a](https://github.com/infra-geo-ouverte/igo2-lib/commit/a8f866a9ad720af9fe365c984473d7c9abe3d6e3))

## [1.13.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.13.0...1.13.1) (2022-11-07)

### Bug Fixes

- **arcgis:** url remplacement may cause errors if mapserver is not enabled ([#1072](https://github.com/infra-geo-ouverte/igo2-lib/issues/1072)) ([0474418](https://github.com/infra-geo-ouverte/igo2-lib/commit/0474418a269a5d66a062b5cf04cecceab09baccb))
- **auth Interceptor:** withCredentials & token conflict ([#1123](https://github.com/infra-geo-ouverte/igo2-lib/issues/1123)) ([d8fb861](https://github.com/infra-geo-ouverte/igo2-lib/commit/d8fb861d27bd6481a6fd7d984d7b9af5850472a0))
- **contextmenu:** handle ios mobile device ([#1119](https://github.com/infra-geo-ouverte/igo2-lib/issues/1119)) ([c26b81e](https://github.com/infra-geo-ouverte/igo2-lib/commit/c26b81e8a439678645556567c2db2c516cb9f3f9))
- delete geometry column from search result or query ([#1108](https://github.com/infra-geo-ouverte/igo2-lib/issues/1108)) ([99a1c3c](https://github.com/infra-geo-ouverte/igo2-lib/commit/99a1c3c7d2b31e959df6ac05e05d7e0d8bb2329d))
- **feature-details:** add multi embedded link condition ([#1124](https://github.com/infra-geo-ouverte/igo2-lib/issues/1124)) ([a787d00](https://github.com/infra-geo-ouverte/igo2-lib/commit/a787d0052ade899792a4f14c0635feb3e56e031c))
- **layer-list:** follow checked or focused layer on layer displacement ([#1116](https://github.com/infra-geo-ouverte/igo2-lib/issues/1116)) ([61bf9da](https://github.com/infra-geo-ouverte/igo2-lib/commit/61bf9dacd63447dc27fad8346d944f825d1ec8dd))
- **measure-poi:** fix measure state layer init / CSS poi fix ([#1113](https://github.com/infra-geo-ouverte/igo2-lib/issues/1113)) ([c2c991f](https://github.com/infra-geo-ouverte/igo2-lib/commit/c2c991f1b6d51dfdce3589046856c3dcbee3ec79))

### Features

- **draw:** Management of the editing of individual element ([#1065](https://github.com/infra-geo-ouverte/igo2-lib/issues/1065)) ([8427863](https://github.com/infra-geo-ouverte/igo2-lib/commit/84278639e23f55ce099b21b6d0574eb66c59abd5))
- **edition:** allow absolute url if config is not defined ([#1127](https://github.com/infra-geo-ouverte/igo2-lib/issues/1127)) ([27bd2fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/27bd2fed8a4cb0740cd7052e28df28943ec4cb12))
- **feature-details:** copy content button alongside the url ([#1114](https://github.com/infra-geo-ouverte/igo2-lib/issues/1114)) ([636a70f](https://github.com/infra-geo-ouverte/igo2-lib/commit/636a70fcd89bdacbd33f39997b729edbfc70ba84))
- **geolocate:** add basic icon button config ([#1085](https://github.com/infra-geo-ouverte/igo2-lib/issues/1085)) ([a243317](https://github.com/infra-geo-ouverte/igo2-lib/commit/a243317ad7011f4ecdbb0db0fc9e2a5c11fa1c22))
- **importExport:** add custom html for clarification ([#1095](https://github.com/infra-geo-ouverte/igo2-lib/issues/1095)) ([7b47d68](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b47d6808f5e2600aadc4683ebd83b2bae36dfcf))
- **searchBar:** add clear search tooltip ([#1111](https://github.com/infra-geo-ouverte/igo2-lib/issues/1111)) ([1b2d1ad](https://github.com/infra-geo-ouverte/igo2-lib/commit/1b2d1adf904deabaf31024c1e99e86f65a05521e))
- **share:** add custom html for clarification ([#1122](https://github.com/infra-geo-ouverte/igo2-lib/issues/1122)) ([c8586d9](https://github.com/infra-geo-ouverte/igo2-lib/commit/c8586d944399043c423d5db9787e71d8d07b1dba))

# [1.13.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.12.1...1.13.0) (2022-10-14)

### Bug Fixes

- **entity-table:** fix edition autocomplete ([#1098](https://github.com/infra-geo-ouverte/igo2-lib/issues/1098)) ([5a0e410](https://github.com/infra-geo-ouverte/igo2-lib/commit/5a0e410ddeca44603bfff02fdbb00e70a826dffe))
- **regex:** fix iphone regex (lookbehind expression) ([#1093](https://github.com/infra-geo-ouverte/igo2-lib/issues/1093)) ([a4c8664](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4c866423def6e1889d2c4d6d383590609bd1455)), closes [#2](https://github.com/infra-geo-ouverte/igo2-lib/issues/2)
- **theming:** fix global core import ([#1103](https://github.com/infra-geo-ouverte/igo2-lib/issues/1103)) ([88b0b96](https://github.com/infra-geo-ouverte/igo2-lib/commit/88b0b9679a14dc31008b4492789e7643cefad434))

### Features

- **app:** upgrade libs + angular14 ([#1094](https://github.com/infra-geo-ouverte/igo2-lib/issues/1094)) ([089e993](https://github.com/infra-geo-ouverte/igo2-lib/commit/089e9931760782ae1a6b12e068fb80223e5e08a3))

## [1.12.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.12.0...1.12.1) (2022-07-13)

### Bug Fixes

- **catalog/spatial-filter:** 1.12.0 fix ([#1080](https://github.com/infra-geo-ouverte/igo2-lib/issues/1080)) ([25444d1](https://github.com/infra-geo-ouverte/igo2-lib/commit/25444d1ea7304c684ed24943e0be146663427c70))
- **geolocation:** fix missing config service ([b9c6ffe](https://github.com/infra-geo-ouverte/igo2-lib/commit/b9c6ffeca14d550ba2219221c78a63ac945d9738))

# [1.12.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.11.1...1.12.0) (2022-06-23)

### Bug Fixes

- **demo:** missing import for indexeddb service ([4530872](https://github.com/infra-geo-ouverte/igo2-lib/commit/453087216b8f15978832db54e7048a5a7f73589b))
- **entity-table:** fix entity-table buttons ([#1041](https://github.com/infra-geo-ouverte/igo2-lib/issues/1041)) ([a671b53](https://github.com/infra-geo-ouverte/igo2-lib/commit/a671b53edb7af9f0b00b67d724f10986b9d6db7c))
- **export:** export to latin1 with no latin1 equivalent characters ([#1042](https://github.com/infra-geo-ouverte/igo2-lib/issues/1042)) ([9d9e8c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/9d9e8c6c3f0fc129661e697328955be76f1cf7d7))
- **import:** imported layers are disabled when offline ([#1047](https://github.com/infra-geo-ouverte/igo2-lib/issues/1047)) ([2e916e3](https://github.com/infra-geo-ouverte/igo2-lib/commit/2e916e3548c304a0726351c43cd3c038b448f53d))
- **ogcfilter:** between operator crash with undefined values for lower and upper boundary ([#1070](https://github.com/infra-geo-ouverte/igo2-lib/issues/1070)) ([f807de4](https://github.com/infra-geo-ouverte/igo2-lib/commit/f807de4ba5669a9fe3534f75abfb93dec02e57a2))
- **ogcfilter:** propertyislike operator crash with undefined values ([#1069](https://github.com/infra-geo-ouverte/igo2-lib/issues/1069)) ([3e8151e](https://github.com/infra-geo-ouverte/igo2-lib/commit/3e8151e56a6d067180c030ad050af67fe8971d15))
- **print:** handle display of legend ([#1051](https://github.com/infra-geo-ouverte/igo2-lib/issues/1051)) ([fd259f3](https://github.com/infra-geo-ouverte/igo2-lib/commit/fd259f399f731f0abafd5aeb3eef02f6691c35ac))
- **print:** tfw filename was different than the tiff file ([#1050](https://github.com/infra-geo-ouverte/igo2-lib/issues/1050)) ([3d73b08](https://github.com/infra-geo-ouverte/igo2-lib/commit/3d73b081b8675ffdf08927ecb150c48960bc2e8e))
- **search-results:** prevent empty message to be shown during typing ([#1061](https://github.com/infra-geo-ouverte/igo2-lib/issues/1061)) ([fcbd5e0](https://github.com/infra-geo-ouverte/igo2-lib/commit/fcbd5e0d50370c404343b35c3d74166b6175cdf4))
- **wms-workspace:** duplicated query on non exposed workspace ([#1039](https://github.com/infra-geo-ouverte/igo2-lib/issues/1039)) ([6a48351](https://github.com/infra-geo-ouverte/igo2-lib/commit/6a48351619bf9e0989050d037631209f0aff2113))

### Features

- **draw:** Management of the editing of the labels ([#1059](https://github.com/infra-geo-ouverte/igo2-lib/issues/1059)) ([2c039e2](https://github.com/infra-geo-ouverte/igo2-lib/commit/2c039e2ed104e3b352c9627ad30b56e69c94fb6a))
- **edition:** allow send config option / url call for dom / add, modify, delete disabled button config ([#1048](https://github.com/infra-geo-ouverte/igo2-lib/issues/1048)) ([31c57f8](https://github.com/infra-geo-ouverte/igo2-lib/commit/31c57f8e083c1a68e5f5aa4571caf5bd081dc229))
- **entity-table:** add css class to hide content ([#1046](https://github.com/infra-geo-ouverte/igo2-lib/issues/1046)) ([ac9e019](https://github.com/infra-geo-ouverte/igo2-lib/commit/ac9e01948f3bdcd77687d0be788c77f1220902e0))
- **feature-details:** open secure docs and images from depot API ([#1015](https://github.com/infra-geo-ouverte/igo2-lib/issues/1015)) ([05cb02e](https://github.com/infra-geo-ouverte/igo2-lib/commit/05cb02e9335c3598df6bb125768a72b0d0d64e54))
- **icherche:** allow + hashtags to be read ([#1056](https://github.com/infra-geo-ouverte/igo2-lib/issues/1056)) ([a1c40a4](https://github.com/infra-geo-ouverte/igo2-lib/commit/a1c40a4d09a9537214b5e4e86b179d7b0905f711))
- **integration:** tool for vector source closest feature ([#994](https://github.com/infra-geo-ouverte/igo2-lib/issues/994)) ([5c4f0a0](https://github.com/infra-geo-ouverte/igo2-lib/commit/5c4f0a0ad531a55438d130f310dc6d9b1cd0f7ff))
- **ogc-filter/dom:** allow domain of values to fill ogc-filter selec… ([#1044](https://github.com/infra-geo-ouverte/igo2-lib/issues/1044)) ([5b52199](https://github.com/infra-geo-ouverte/igo2-lib/commit/5b521994a97b2e17ccb886354d2f9587d95744b8))
- **search-results:** Top panel state default options in config ([#1054](https://github.com/infra-geo-ouverte/igo2-lib/issues/1054)) ([5b90527](https://github.com/infra-geo-ouverte/igo2-lib/commit/5b90527b4ac0024293efe8fcb6f74f0b8491b374))
- **wakeLockApi:** button to prevent the screen lock ([#1036](https://github.com/infra-geo-ouverte/igo2-lib/issues/1036)) ([ec0cae3](https://github.com/infra-geo-ouverte/igo2-lib/commit/ec0cae30b3c9781d4cea90f9e30868dfaf9921c8))

## [1.11.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.11.0...1.11.1) (2022-04-07)

### Bug Fixes

- **context/layer-list-tool:** fix CSS overflow with Chrome 100 ([#1031](https://github.com/infra-geo-ouverte/igo2-lib/issues/1031)) ([6b48062](https://github.com/infra-geo-ouverte/igo2-lib/commit/6b48062a14cddc97aaf81cf66e34f0b1f4f0532f))
- **entity-table:** fix formControl with no properties entity ([#1032](https://github.com/infra-geo-ouverte/igo2-lib/issues/1032)) ([b52ee5c](https://github.com/infra-geo-ouverte/igo2-lib/commit/b52ee5ca3b350bb677513536f3d9e5eadfa38cef))
- **workspace:** fix wfs-actions workspace demo ([#1034](https://github.com/infra-geo-ouverte/igo2-lib/issues/1034)) ([46c9fd6](https://github.com/infra-geo-ouverte/igo2-lib/commit/46c9fd6c3241f9fcbb3fcb27e49c349fd83eb7d0))

### Reverts

- Revert "feat(layerSync): prevent refresh of linked layer if applied OGC filters are the same (#1027)" (#1033) ([7ae2b2b](https://github.com/infra-geo-ouverte/igo2-lib/commit/7ae2b2bdfa82d5801cfc9c052b5db0f0d2e4e6bb)), closes [#1027](https://github.com/infra-geo-ouverte/igo2-lib/issues/1027) [#1033](https://github.com/infra-geo-ouverte/igo2-lib/issues/1033)

# [1.11.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.10.0...1.11.0) (2022-03-30)

### Bug Fixes

- **about:** fix depot url ([#1009](https://github.com/infra-geo-ouverte/igo2-lib/issues/1009)) ([c168667](https://github.com/infra-geo-ouverte/igo2-lib/commit/c168667e0ddb8bec339d4ad85aa7f627a9b66119))
- **auth:** Fix disabled login button with autocomplete form ([#1003](https://github.com/infra-geo-ouverte/igo2-lib/issues/1003)) ([e726b0b](https://github.com/infra-geo-ouverte/igo2-lib/commit/e726b0bd24257c56c90d0696ff099eec0cad452d))
- Circular dependency with toastr ([#1005](https://github.com/infra-geo-ouverte/igo2-lib/issues/1005)) ([ebe4585](https://github.com/infra-geo-ouverte/igo2-lib/commit/ebe4585eee6f00afc3dee00d97d0941baf01350a))
- Don't fail when creating form fields or groups without validator ([#1006](https://github.com/infra-geo-ouverte/igo2-lib/issues/1006)) ([7cb159f](https://github.com/infra-geo-ouverte/igo2-lib/commit/7cb159f16b19a8cf8210146f6dfe5f1aa1acf041))
- **export:** fix layers error when export tool is aleardy selected ([#1025](https://github.com/infra-geo-ouverte/igo2-lib/issues/1025)) ([0a0fba1](https://github.com/infra-geo-ouverte/igo2-lib/commit/0a0fba10ee173ddf1207497e9c14942c31494c1f))
- **icherche:** fix icherche hashtags caps lock comparison ([0f71795](https://github.com/infra-geo-ouverte/igo2-lib/commit/0f71795a1051093647a6dcecd1381fd3940d48b8))
- **layer-legend:** fix arcgisrest and imagearcgisrest legend ([#966](https://github.com/infra-geo-ouverte/igo2-lib/issues/966)) ([5ca2e4a](https://github.com/infra-geo-ouverte/igo2-lib/commit/5ca2e4a4f8ad7ad033f83b369adbb6e73ecce553))
- **layer-legend:** fix layer-legend display ([#1026](https://github.com/infra-geo-ouverte/igo2-lib/issues/1026)) ([55b864e](https://github.com/infra-geo-ouverte/igo2-lib/commit/55b864e8fa06fd75a4f6e9a28ff66266cb897d75))
- **layerSync:** error on time property transfer ([#1028](https://github.com/infra-geo-ouverte/igo2-lib/issues/1028)) ([70c613b](https://github.com/infra-geo-ouverte/igo2-lib/commit/70c613bb3a47df93c172cf17c6026c06aac00ea6))
- Make sure the dynamic component outlet doesn,t raise an error when the component is undefined ([#1007](https://github.com/infra-geo-ouverte/igo2-lib/issues/1007)) ([2170f16](https://github.com/infra-geo-ouverte/igo2-lib/commit/2170f16ee0c50f2a1528cb53d6f98fd10ce1108c))
- **ogcFilters:** fix advancedOgcFilters when filters not defined ([#1018](https://github.com/infra-geo-ouverte/igo2-lib/issues/1018)) ([df4078e](https://github.com/infra-geo-ouverte/igo2-lib/commit/df4078e1b616494eef4b76dafd8e6977985ee8b1))
- **search bar:** fix an issue with the search bar when the store is null ([#1000](https://github.com/infra-geo-ouverte/igo2-lib/issues/1000)) ([d54f580](https://github.com/infra-geo-ouverte/igo2-lib/commit/d54f580daf69d6fc27623f35de7f98afd6045e83))
- **typing:** Fix typing issues in geometry controls ([#999](https://github.com/infra-geo-ouverte/igo2-lib/issues/999)) ([c167a77](https://github.com/infra-geo-ouverte/igo2-lib/commit/c167a770cc48c2f1e99bb33fb348b07f63db52cc))

### Features

- **edition-workspace:** allow layer edition from new edition workspace ([#996](https://github.com/infra-geo-ouverte/igo2-lib/issues/996)) ([c4ddfc6](https://github.com/infra-geo-ouverte/igo2-lib/commit/c4ddfc670be476b772b25a32531003ead1b6a185))
- **export:** added headers in separators ([#967](https://github.com/infra-geo-ouverte/igo2-lib/issues/967)) ([2f87eed](https://github.com/infra-geo-ouverte/igo2-lib/commit/2f87eed3d0ad90519d275084d5d4d7409946d89c))
- **geo:** adding initial button component files ([#957](https://github.com/infra-geo-ouverte/igo2-lib/issues/957)) ([81f0ace](https://github.com/infra-geo-ouverte/igo2-lib/commit/81f0aceb9eb87be471416579947cda3bef04ec94))
- **geo:** info content on map ([#979](https://github.com/infra-geo-ouverte/igo2-lib/issues/979)) ([8e88f41](https://github.com/infra-geo-ouverte/igo2-lib/commit/8e88f41806265440d79e55218bee76227620eb06))
- **layerSync:** prevent refresh of linked layer if applied OGC filters are the same ([#1027](https://github.com/infra-geo-ouverte/igo2-lib/issues/1027)) ([f4affea](https://github.com/infra-geo-ouverte/igo2-lib/commit/f4affea0d597eda5ac27066181d377acb5af2756))
- **network:** prevent showing 2 different network state simultaneously ([#992](https://github.com/infra-geo-ouverte/igo2-lib/issues/992)) ([7d8633c](https://github.com/infra-geo-ouverte/igo2-lib/commit/7d8633c028945a54686c035c0b7e5eb80f51e4bc))
- **ogc-time:** allow alias to ogc-filter-time section ([#981](https://github.com/infra-geo-ouverte/igo2-lib/issues/981)) ([55c634a](https://github.com/infra-geo-ouverte/igo2-lib/commit/55c634a96ffc42f0eb87bd8f9c775344394d9b3c))
- **query:** provide a way to show the querytitle in htmlgml2 queryformat ([#963](https://github.com/infra-geo-ouverte/igo2-lib/issues/963)) ([2304568](https://github.com/infra-geo-ouverte/igo2-lib/commit/23045680a3318efe29c741a51049b0102339e968))

# [1.10.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.9.4...1.10.0) (2021-12-13)

### Bug Fixes

- **arcgis layer:** attribution cause crash on add layer. ([#942](https://github.com/infra-geo-ouverte/igo2-lib/issues/942)) ([dbdf136](https://github.com/infra-geo-ouverte/igo2-lib/commit/dbdf1361238b6655aa124071a5568986026309c5))
- **layer-legend-component:** problem with a layer contain many layerName into the layer-legend ([c1275dd](https://github.com/infra-geo-ouverte/igo2-lib/commit/c1275ddd3e9fdd2cbf7260aa4ea56e5f484c5a15))
- **message:** undefined title crash of message service ([#960](https://github.com/infra-geo-ouverte/igo2-lib/issues/960)) ([01629a6](https://github.com/infra-geo-ouverte/igo2-lib/commit/01629a60e15e397e62a4bd3902f052109b2dd16b))

### Features

- **advanced-coordinates:** add the map's scale and resolution to the tool. ([#953](https://github.com/infra-geo-ouverte/igo2-lib/issues/953)) ([ba6af1d](https://github.com/infra-geo-ouverte/igo2-lib/commit/ba6af1d676ef074a845d7c56e59bbc518118c70e))
- **core:** notification are now based on ngx-toastr ([82544c0](https://github.com/infra-geo-ouverte/igo2-lib/commit/82544c0499b841bfa66d1cc96de3a223a1eb7743))
- **export:** added possibility of exporting merged CSV files ([#949](https://github.com/infra-geo-ouverte/igo2-lib/issues/949)) ([a24382a](https://github.com/infra-geo-ouverte/igo2-lib/commit/a24382acf4964167cbb6dd436fc0c41cd8cd65c4))
- **hover/sba:** Style by attribute and Hover style refactor ([#951](https://github.com/infra-geo-ouverte/igo2-lib/issues/951)) ([c2b5041](https://github.com/infra-geo-ouverte/igo2-lib/commit/c2b5041e9ef81e565a66866382cb32fae9bb3783))
- **messages:** message at the layer level, config to allow the message to be shown each time the layer is set to be visible. ([#943](https://github.com/infra-geo-ouverte/igo2-lib/issues/943)) ([3822e9c](https://github.com/infra-geo-ouverte/igo2-lib/commit/3822e9c5bb426cb73e8398466dbf2e6e123a786c))
- **spatial-filter:** add search results entity table ([#954](https://github.com/infra-geo-ouverte/igo2-lib/issues/954)) ([94f999f](https://github.com/infra-geo-ouverte/igo2-lib/commit/94f999fb6e85a2857be5804dd86ae2d9298e99ca))

## [1.9.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.9.3...1.9.4) (2021-11-15)

### Bug Fixes

- **context/vector/map/measure:** various fix ([#934](https://github.com/infra-geo-ouverte/igo2-lib/issues/934)) ([227d5e8](https://github.com/infra-geo-ouverte/igo2-lib/commit/227d5e8d436f1338a2d3cb52d8e80f2bbf388a7b))
- **directions:** observable management on search ([#929](https://github.com/infra-geo-ouverte/igo2-lib/issues/929)) ([07089b8](https://github.com/infra-geo-ouverte/igo2-lib/commit/07089b855ae94ed31705fb9c967d79092c683732))
- **legend:** for layer with more than one layer ([#935](https://github.com/infra-geo-ouverte/igo2-lib/issues/935)) ([f39d868](https://github.com/infra-geo-ouverte/igo2-lib/commit/f39d8686adb4791fae3c9cca48a507d586c2f00e))
- **route-service:** URL issue from certains Office suite (teams, word… ([#937](https://github.com/infra-geo-ouverte/igo2-lib/issues/937)) ([0c4270b](https://github.com/infra-geo-ouverte/igo2-lib/commit/0c4270bd8a4f76d7cb9f8e068d8b6a894e6b8704))
- **storedQueries:** param was undefined. ([#933](https://github.com/infra-geo-ouverte/igo2-lib/issues/933)) ([9b7fcf2](https://github.com/infra-geo-ouverte/igo2-lib/commit/9b7fcf2a0bed561cac024aa84515307a2f420ddf))

### Features

- **auth:** Provide a config to setup a key value based on regex value ([#926](https://github.com/infra-geo-ouverte/igo2-lib/issues/926)) ([b9bc82e](https://github.com/infra-geo-ouverte/igo2-lib/commit/b9bc82edd16129591b48fe739b61d4557965854c))
- **catalog:** add catalog dialog, the title is now a list to select values ([#931](https://github.com/infra-geo-ouverte/igo2-lib/issues/931)) ([33543e5](https://github.com/infra-geo-ouverte/igo2-lib/commit/33543e54b751acbf9cc9bf0ef6a1695b7cb21510))
- **query:** Custom url for get info ([#927](https://github.com/infra-geo-ouverte/igo2-lib/issues/927)) ([1e51e39](https://github.com/infra-geo-ouverte/igo2-lib/commit/1e51e39c2ad43050a3f862aff231ef5bf25de501))

### Reverts

- Revert "fix(context-menu): ios context menu was not available. (#899)" (#939) ([4571b98](https://github.com/infra-geo-ouverte/igo2-lib/commit/4571b98f0477971d61716078b19c5fa5c379cc55)), closes [#899](https://github.com/infra-geo-ouverte/igo2-lib/issues/899) [#939](https://github.com/infra-geo-ouverte/igo2-lib/issues/939)

## [1.9.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.9.2...1.9.3) (2021-10-18)

## [1.9.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.9.1...1.9.2) (2021-10-15)

### Bug Fixes

- **igoMatBadgeIcon:** empty matBadge directive cause icondirective to… ([#924](https://github.com/infra-geo-ouverte/igo2-lib/issues/924)) ([9629b6e](https://github.com/infra-geo-ouverte/igo2-lib/commit/9629b6e8c671db40f2ef0a7fe66c069c6c25b507))
- **layer-legend:** WMS datasource with multiple style were not updated after style selection ([b1cc06f](https://github.com/infra-geo-ouverte/igo2-lib/commit/b1cc06f8c6c119809818172c63d7c1f44a3154b3))
- **layer-list:** fix layer-list tool crop ([#925](https://github.com/infra-geo-ouverte/igo2-lib/issues/925)) ([a3b32dd](https://github.com/infra-geo-ouverte/igo2-lib/commit/a3b32dd5b4d7c4538c912193ef8ca7666b8431bf))

### Features

- **home-button:** add home-button component to library ([#923](https://github.com/infra-geo-ouverte/igo2-lib/issues/923)) ([4d0c8b2](https://github.com/infra-geo-ouverte/igo2-lib/commit/4d0c8b27099e47d641e82937cbe22d9dfb96b3bf))

## [1.9.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.9.0...1.9.1) (2021-10-13)

### Bug Fixes

- **demo:** urls ([505e177](https://github.com/infra-geo-ouverte/igo2-lib/commit/505e177643ff43f80124bf9f7806691780b2fd32))
- **draw:** selected feature label transfered in popup ([#912](https://github.com/infra-geo-ouverte/igo2-lib/issues/912)) ([7efb8bf](https://github.com/infra-geo-ouverte/igo2-lib/commit/7efb8bf60b9d64a8bc1fe3987a530876b7b1d9a6))

### Features

- **geolocation:** add a point (center) to the geolocation feature ([#908](https://github.com/infra-geo-ouverte/igo2-lib/issues/908)) ([45199c2](https://github.com/infra-geo-ouverte/igo2-lib/commit/45199c2c5317da783051c4e63444c13b2dcada87))
- **sharemap:** keep the layer wms version on share map ([#917](https://github.com/infra-geo-ouverte/igo2-lib/issues/917)) ([5dc345d](https://github.com/infra-geo-ouverte/igo2-lib/commit/5dc345d1d141a8f9019795998de48a44978fc85c))

### Reverts

- Revert "1.9.1" ([5f924c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/5f924c68b7160647d6ed4f536a05256e6847b5e5))

# [1.9.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.8.2...1.9.0) (2021-09-20)

### Bug Fixes

- **baselayers-switcher:** migration to ng12 anf ol6.6 broke shift drag zoom behavior ([cf89418](https://github.com/infra-geo-ouverte/igo2-lib/commit/cf894183e9f04e89a8386c2f176ccee030284e14))
- **context-menu:** ios context menu was not available. ([#899](https://github.com/infra-geo-ouverte/igo2-lib/issues/899)) ([52da7a4](https://github.com/infra-geo-ouverte/igo2-lib/commit/52da7a4676c295d30482b616fb765d466cd6c5ce))
- **customloader:** vector source now have a custom loader for non url source ([6a54b73](https://github.com/infra-geo-ouverte/igo2-lib/commit/6a54b73183dd0f0b0e69168803751b7c94191d56))
- **demo:** https url and extra dependencies removed ([b5ad553](https://github.com/infra-geo-ouverte/igo2-lib/commit/b5ad5534e63a94051c8f6abb49667535ae37502d))
- **demo:** https url and extra dependencies removed ([e94e4a2](https://github.com/infra-geo-ouverte/igo2-lib/commit/e94e4a2cf9b7bc6d4e36e2bd624596c314c0e6b4))
- **draw-measurer:** fix ol typo ([cbfc116](https://github.com/infra-geo-ouverte/igo2-lib/commit/cbfc116c81fe4085d1c21289beeac0761125256a))
- **feature-details:** fix foreground color ([265bf07](https://github.com/infra-geo-ouverte/igo2-lib/commit/265bf07a482edd05de06063ae112800271a29971))
- **geometry-form:** drawControl and freehandDraw won't toggle ([#898](https://github.com/infra-geo-ouverte/igo2-lib/issues/898)) ([b17b1c5](https://github.com/infra-geo-ouverte/igo2-lib/commit/b17b1c59f092c4a0080663e1cc00c69dbd594104))
- **imports-service:** Ogre error 500 handling ([#890](https://github.com/infra-geo-ouverte/igo2-lib/issues/890)) ([696efa0](https://github.com/infra-geo-ouverte/igo2-lib/commit/696efa04c45ffb4e35c6341d6f98b559e984f5b0))
- layer and store deletion for draw/mesure/direction tool [#648](https://github.com/infra-geo-ouverte/igo2-lib/issues/648) … ([#896](https://github.com/infra-geo-ouverte/igo2-lib/issues/896)) ([6d49e0f](https://github.com/infra-geo-ouverte/igo2-lib/commit/6d49e0f4d2de0fb81b8a32e975b2089324f69152)), closes [#650](https://github.com/infra-geo-ouverte/igo2-lib/issues/650)
- **map:** attribution button position ([b4ea5df](https://github.com/infra-geo-ouverte/igo2-lib/commit/b4ea5df4124a5bce95bce7c7b4d5e8763da20bc3))
- **map:** Legend scroll bug fix ([#903](https://github.com/infra-geo-ouverte/igo2-lib/issues/903)) ([41f0f71](https://github.com/infra-geo-ouverte/igo2-lib/commit/41f0f71fcf4325a2ab5ca02cd10825a77c037427))
- **measurer:** label text color ([d72d832](https://github.com/infra-geo-ouverte/igo2-lib/commit/d72d8321f1d34c01f5f102b9e585ccf57b64e917))
- **search-settings:** fix sub menu checkbox display ([0d86344](https://github.com/infra-geo-ouverte/igo2-lib/commit/0d86344e4283f65eeae322735df54ed971701b5b))
- **sharemap:** textearea size ([662805c](https://github.com/infra-geo-ouverte/igo2-lib/commit/662805c9b30f642f088855260c750c80c4a5cf31))
- **vector-layer:** moving wfs loader (datasource) to vector-layer loader to allow featuresloadend to be fired inside a custom loader ([4c7969c](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c7969c1e72fbbe090cdae92c080d3331d43d5dc))
- **wms-wfs:** fix olFormatCls ([ef1e120](https://github.com/infra-geo-ouverte/igo2-lib/commit/ef1e1204413ef4178147d1b7a48fc5b681587213))

### Features

- **about:** add a header section ([bd40051](https://github.com/infra-geo-ouverte/igo2-lib/commit/bd400517f3e767deb95236917995f6f927a93168))
- **draw:** new features, improvements and bug fixes ([#897](https://github.com/infra-geo-ouverte/igo2-lib/issues/897)) ([9dd0b3c](https://github.com/infra-geo-ouverte/igo2-lib/commit/9dd0b3ccbf3d68a0c3afe14a14ca8a4d17bef922))
- **libs:** upgrade librairies to angular 11 ([1bf0506](https://github.com/infra-geo-ouverte/igo2-lib/commit/1bf0506226b50d933b4223b1ddf8ef97fe6f0048))
- **map:** Advanced map tool ([#900](https://github.com/infra-geo-ouverte/igo2-lib/issues/900)) ([a0c7785](https://github.com/infra-geo-ouverte/igo2-lib/commit/a0c778541c7351fee92e73f7a4fbc190238f5e33))

## [1.8.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.8.1...1.8.2) (2021-08-12)

### Bug Fixes

- **feature-details:** create base href with relative url ([c4bf4bf](https://github.com/infra-geo-ouverte/igo2-lib/commit/c4bf4bfd70d15daa39e173b24de76a1d9f5d6df8))

## [1.8.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.8.0...1.8.1) (2021-07-07)

### Bug Fixes

- **layer-list:** scrollable zone bug fix ([#889](https://github.com/infra-geo-ouverte/igo2-lib/issues/889)) ([0c3a2b7](https://github.com/infra-geo-ouverte/igo2-lib/commit/0c3a2b77a5eeb87addc286f6a888223b7016044d))

# [1.8.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.7.2...1.8.0) (2021-07-07)

### Bug Fixes

- **about-tool:** disabled guide button when downloading ([#868](https://github.com/infra-geo-ouverte/igo2-lib/issues/868)) ([e67d951](https://github.com/infra-geo-ouverte/igo2-lib/commit/e67d9511bc0ebae1798388473c0d71b961e14a60))
- **capabilities:** fix bad geographical extent ([#886](https://github.com/infra-geo-ouverte/igo2-lib/issues/886)) ([2bb29d8](https://github.com/infra-geo-ouverte/igo2-lib/commit/2bb29d832f54389b9817fa35233a2aa8b4c60d73))
- **catalog:** predefind catalog options were not used correctly ([#873](https://github.com/infra-geo-ouverte/igo2-lib/issues/873)) ([afefce2](https://github.com/infra-geo-ouverte/igo2-lib/commit/afefce276968ade11432e04794d315e49b1eeb99))
- **directions:** auto zoom on new stop/route ([#874](https://github.com/infra-geo-ouverte/igo2-lib/issues/874)) ([b9d3b1f](https://github.com/infra-geo-ouverte/igo2-lib/commit/b9d3b1f94db6852d26c2b777575a44f88dce58da))
- ESRI layer + inverted epsg codes for import ([#880](https://github.com/infra-geo-ouverte/igo2-lib/issues/880)) ([ceedf2e](https://github.com/infra-geo-ouverte/igo2-lib/commit/ceedf2edcbcdaee7bf37201bdc0c16b6f8cff035))
- **icherche:** remove types not available ([ce0ea20](https://github.com/infra-geo-ouverte/igo2-lib/commit/ce0ea20d0e897e5a62071085fa1578bbe1e0bd58))
- **image-layer:** catch mapserver error with 200 status ([#867](https://github.com/infra-geo-ouverte/igo2-lib/issues/867)) ([1a43b64](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a43b643f6e19fc09dde397f78da92ad1bb8531c))
- **ogcFilter:** fixed button badge ([#884](https://github.com/infra-geo-ouverte/igo2-lib/issues/884)) ([80cc58a](https://github.com/infra-geo-ouverte/igo2-lib/commit/80cc58aa2ed0f3ff72a730155c7edf32addf60db))
- **osmDataSource:** do not automatically take the standard osm tile service url ([#864](https://github.com/infra-geo-ouverte/igo2-lib/issues/864)) ([536e18f](https://github.com/infra-geo-ouverte/igo2-lib/commit/536e18f9e9278e89dfcd36a13aa70c228de6e968))
- **query:** wms query in geojson format now use source fields as alias ([#862](https://github.com/infra-geo-ouverte/igo2-lib/issues/862)) ([818cc7f](https://github.com/infra-geo-ouverte/igo2-lib/commit/818cc7f007a71596a0b4dd3a7cc0766eaf26eb37))

### Features

- **auth:** Add azure b2c ([#872](https://github.com/infra-geo-ouverte/igo2-lib/issues/872)) ([d0fe84b](https://github.com/infra-geo-ouverte/igo2-lib/commit/d0fe84bc0d83568d3d5972ccaba9c5a76f9c7f53))
- **context:** handling an array of message instead of a message. ([#865](https://github.com/infra-geo-ouverte/igo2-lib/issues/865)) ([81f6542](https://github.com/infra-geo-ouverte/igo2-lib/commit/81f65426f7936fc608adbc21135f31bc64357c9c)), closes [#877](https://github.com/infra-geo-ouverte/igo2-lib/issues/877)
- **icherche:** allow #number and add hq ([f42f242](https://github.com/infra-geo-ouverte/igo2-lib/commit/f42f242b56fa84bc98f50043d94e36c090f67770))
- **layer-list:** add button to zoom to the extent of a layer ([#860](https://github.com/infra-geo-ouverte/igo2-lib/issues/860)) ([f9ebfce](https://github.com/infra-geo-ouverte/igo2-lib/commit/f9ebfced436cfddf92fd9ce9d9828c670ba5fc75))
- **layer-list:** Fix layer filter on top of list ([#882](https://github.com/infra-geo-ouverte/igo2-lib/issues/882)) ([5cdd067](https://github.com/infra-geo-ouverte/igo2-lib/commit/5cdd067fe8e0d972737ebde448c9254562dac619))
- **layer-list:** move/change select all button with checkbox and add scrollbar in tools ([#887](https://github.com/infra-geo-ouverte/igo2-lib/issues/887)) ([18854b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/18854b1d0e243e376c07c8e957bd85ea1c686bec))
- **measurer:** Display distances of the measures of a polygon ([#878](https://github.com/infra-geo-ouverte/igo2-lib/issues/878)) ([5e4612d](https://github.com/infra-geo-ouverte/igo2-lib/commit/5e4612d36453ccc40495cf4edfbfb579e257df68))
- **ogcFilter:** add MatSelect to selectors for OGC filters and bug fixes ([#876](https://github.com/infra-geo-ouverte/igo2-lib/issues/876)) ([22612a1](https://github.com/infra-geo-ouverte/igo2-lib/commit/22612a17954668ba5f605adc5427556cac57b9b9))
- **print:** Choose legend position on the page or on a new page([#883](https://github.com/infra-geo-ouverte/igo2-lib/issues/883)) ([8e945fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/8e945fc7b5f1c117f1929f3e85f4fd16d7587801))
- **scale bar:** scale bar is now configurable ([#859](https://github.com/infra-geo-ouverte/igo2-lib/issues/859)) ([4156461](https://github.com/infra-geo-ouverte/igo2-lib/commit/41564610903408f51cc638f7155b2982f5d36cc7))
- **search:** provide style by a search result (server side) ([#870](https://github.com/infra-geo-ouverte/igo2-lib/issues/870)) ([f9e530c](https://github.com/infra-geo-ouverte/igo2-lib/commit/f9e530c7a8456c88958392f5b0e23540af070182))
- **theme:** create a new theme bluedq ([#888](https://github.com/infra-geo-ouverte/igo2-lib/issues/888)) ([7fd1fa0](https://github.com/infra-geo-ouverte/igo2-lib/commit/7fd1fa0104bdcd9cab791e3fc20c5b2de7710132))
- **vector:** more formats available ([7247a0d](https://github.com/infra-geo-ouverte/igo2-lib/commit/7247a0de803f477bff5af9d18232f7048bc77ca0))

## [1.7.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.7.1...1.7.2) (2021-05-17)

### Bug Fixes

- **map utils:** conversion to latitude longitude out of bounds ([#858](https://github.com/infra-geo-ouverte/igo2-lib/issues/858)) ([6a5a211](https://github.com/infra-geo-ouverte/igo2-lib/commit/6a5a2113a079e622c50a1a32ad5567f1f2899cca))
- **ogcfilters:** minors fixes ([#851](https://github.com/infra-geo-ouverte/igo2-lib/issues/851)) ([0b037fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/0b037feb519d366ca4f4e71164c1893703c376c2))

### Features

- **add-catalog-dialog:** add info message if catalog isn't in the pr… ([#854](https://github.com/infra-geo-ouverte/igo2-lib/issues/854)) ([301e941](https://github.com/infra-geo-ouverte/igo2-lib/commit/301e94152ad4818eac9905954fd1ba5913d34d05))

## [1.7.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.7.0...1.7.1) (2021-05-03)

### Bug Fixes

- **directions:** marker was not correctly selected. ([#844](https://github.com/infra-geo-ouverte/igo2-lib/issues/844)) ([04ae23b](https://github.com/infra-geo-ouverte/igo2-lib/commit/04ae23b12d6c4b914f366b93143a707b33ac7123))
- **imagearcgisrest/layer-legend:** release 1.7 various fix ([#848](https://github.com/infra-geo-ouverte/igo2-lib/issues/848)) ([5ab57af](https://github.com/infra-geo-ouverte/igo2-lib/commit/5ab57af5808f101c2ce8225be04e0c9a85a0f3e8))
- **ogcFilter:** css fix for pushButtons title ([#846](https://github.com/infra-geo-ouverte/igo2-lib/issues/846)) ([05cbf68](https://github.com/infra-geo-ouverte/igo2-lib/commit/05cbf689e9b63f4ceba4e978ffd82a7dd15b84ed))
- **ogcFilters:** fix wfs datasource ogcFilters / clearTimeout for checkbox filters ([#849](https://github.com/infra-geo-ouverte/igo2-lib/issues/849)) ([99f9d75](https://github.com/infra-geo-ouverte/igo2-lib/commit/99f9d75985f037e93575ffea1faf5137fe1ded27))
- **ogcFilters:** various fix for release 1.7 ([#847](https://github.com/infra-geo-ouverte/igo2-lib/issues/847)) ([166a895](https://github.com/infra-geo-ouverte/igo2-lib/commit/166a895b0cad266230e1a25f7797f86a931e92a3))

### Features

- **directions:** let the layer into the layer list (to be printed) ([#845](https://github.com/infra-geo-ouverte/igo2-lib/issues/845)) ([e53721a](https://github.com/infra-geo-ouverte/igo2-lib/commit/e53721a148662a5003574832a63404483d23f83d))
- **search:** computeTermSimilarity is now not case sensitive ([#850](https://github.com/infra-geo-ouverte/igo2-lib/issues/850)) ([ef9e548](https://github.com/infra-geo-ouverte/igo2-lib/commit/ef9e548c6a5fdb83687495c53b8101f62454d216))

# [1.7.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.6.4...1.7.0) (2021-04-26)

### Bug Fixes

- **context:** load context without authService ([075fb9b](https://github.com/infra-geo-ouverte/igo2-lib/commit/075fb9b8508052a628b46ae99ede302fa0e6a707))
- **context:** update context when auth changed ([882e663](https://github.com/infra-geo-ouverte/igo2-lib/commit/882e6635656495af460a9126ab919c1542a75f99))
- disabled buttons look like they are ([757659d](https://github.com/infra-geo-ouverte/igo2-lib/commit/757659dc6471a9130e9869c19d8e483b1429eb3b))
- **feature-details:** fix secure iframes ([5786376](https://github.com/infra-geo-ouverte/igo2-lib/commit/5786376830976f072bfecacb85ed76e985b33828))
- **icherche:** allow + charactere ([2267bed](https://github.com/infra-geo-ouverte/igo2-lib/commit/2267bed6850a27b9dd7bd126da7f53e752eeb66c))
- **icherche:** encode + correctly ([02650a4](https://github.com/infra-geo-ouverte/igo2-lib/commit/02650a4b242e483cd4981423611eae22a2082376))
- **icherche:** fix distance options for reverse icherche ([ee17b8f](https://github.com/infra-geo-ouverte/igo2-lib/commit/ee17b8f308e15c608a5b378a5bd418fc9e6453cd))
- **ilayer:** more results ([#842](https://github.com/infra-geo-ouverte/igo2-lib/issues/842)) ([63ed85c](https://github.com/infra-geo-ouverte/igo2-lib/commit/63ed85c84402d27ff774acb5bee2def47fa38aea))
- **layer-legend:** catch getLegendGraphic error ([#834](https://github.com/infra-geo-ouverte/igo2-lib/issues/834)) ([2d440b7](https://github.com/infra-geo-ouverte/igo2-lib/commit/2d440b756278fb3d18b9959254bbb9fafad6e147))
- **pointerSummary:** delete the mouseout - due to issues on rdp connections ([#829](https://github.com/infra-geo-ouverte/igo2-lib/issues/829)) ([e9ac980](https://github.com/infra-geo-ouverte/igo2-lib/commit/e9ac9802f73c883dac2274bcf5263ad630d4764e))
- **print:** graphic scale + attribution in print pdf ([#832](https://github.com/infra-geo-ouverte/igo2-lib/issues/832)) ([82ff8b5](https://github.com/infra-geo-ouverte/igo2-lib/commit/82ff8b5a91ffb720b24488932cda9462f851cc36))
- **shareMap:** update url if the baselayer is changed ([#827](https://github.com/infra-geo-ouverte/igo2-lib/issues/827)) ([fa34773](https://github.com/infra-geo-ouverte/igo2-lib/commit/fa34773092d8017c547e43259df2383037031d64))

### Features

- **about-tool:** authenticated training guide ([#826](https://github.com/infra-geo-ouverte/igo2-lib/issues/826)) ([18f3ae8](https://github.com/infra-geo-ouverte/igo2-lib/commit/18f3ae831f075a2c429e1aad4d7b676a065b1b33))
- **about-tool:** Open guide on new tab / add menu if multiple ([#833](https://github.com/infra-geo-ouverte/igo2-lib/issues/833)) ([858e40f](https://github.com/infra-geo-ouverte/igo2-lib/commit/858e40f11a9e1d559a6347e0323f8419d7d1c1d8))
- **catalog:** advertize warning if layer or catalog come from an external source ([#835](https://github.com/infra-geo-ouverte/igo2-lib/issues/835)) ([a6a910c](https://github.com/infra-geo-ouverte/igo2-lib/commit/a6a910c421f45a49887f3a5d598a7e76dddcca55))
- **draw:** draw points as icons ([#837](https://github.com/infra-geo-ouverte/igo2-lib/issues/837)) ([e617969](https://github.com/infra-geo-ouverte/igo2-lib/commit/e6179696ee714a893c5ab7e12b861dba0ecc6ffc)), closes [#645](https://github.com/infra-geo-ouverte/igo2-lib/issues/645) [#646](https://github.com/infra-geo-ouverte/igo2-lib/issues/646)
- **igo-feature-detail:** add html display event ([#830](https://github.com/infra-geo-ouverte/igo2-lib/issues/830)) ([e4128c1](https://github.com/infra-geo-ouverte/igo2-lib/commit/e4128c15b12c6a19964727717be5087fd78114da))
- **ilayer:** add ecmax setting ([fc81111](https://github.com/infra-geo-ouverte/igo2-lib/commit/fc811111a45fe7de56e95b6770117894f425ce95))
- **imagearcgisrest:** add possibility to use renderingRule param ([f475c1e](https://github.com/infra-geo-ouverte/igo2-lib/commit/f475c1ebe930b46b6e7fe3a0d508a40db36a8c24))
- **message:** add an optional date range to message application ([#839](https://github.com/infra-geo-ouverte/igo2-lib/issues/839)) ([01d5eef](https://github.com/infra-geo-ouverte/igo2-lib/commit/01d5eefb65c3dcfcceca77eb835d3c4fa000253b))
- **ogc-filters:** Reshuffle of ogc filter selection ([#831](https://github.com/infra-geo-ouverte/igo2-lib/issues/831)) ([c173e36](https://github.com/infra-geo-ouverte/igo2-lib/commit/c173e369ebec7392bc74042d89b2db38e6de7f35))
- **search-source:** add settings in storage ([3d53ed7](https://github.com/infra-geo-ouverte/igo2-lib/commit/3d53ed7dd113f29084af61e1e141589e1e2b8e8a))
- **search:** add a method to manage if search results's geometrie are shown on map ([#825](https://github.com/infra-geo-ouverte/igo2-lib/issues/825)) ([dfd4a19](https://github.com/infra-geo-ouverte/igo2-lib/commit/dfd4a19251702f7bb69a8602c62ab3e761391196))
- **search:** allow multiple search term separated by a term splitter ([#821](https://github.com/infra-geo-ouverte/igo2-lib/issues/821)) ([15db5e6](https://github.com/infra-geo-ouverte/igo2-lib/commit/15db5e6d3324ed32b4602c4a9767c18113cbc647))
- **searchSource - coordinate:** show radius when available ([02fc015](https://github.com/infra-geo-ouverte/igo2-lib/commit/02fc015f0f1f30414b1c619e1f7f46886c9952c5))
- **secure-image.pipe:** put in cache the requested url (legend retrieval) ([#841](https://github.com/infra-geo-ouverte/igo2-lib/issues/841)) ([2b128bc](https://github.com/infra-geo-ouverte/igo2-lib/commit/2b128bc74966b9d781d94220f55f3582a8dd6927))
- **share-map:** show the 2 options: sharing by context or by url ([ec19474](https://github.com/infra-geo-ouverte/igo2-lib/commit/ec19474511e4a800833b05878a3caf0d301482f2))

## [1.6.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.6.3...1.6.4) (2021-03-15)

### Bug Fixes

- **arcgisREST:** fix forced title and legend for arcgis layer ([#819](https://github.com/infra-geo-ouverte/igo2-lib/issues/819)) ([abdd881](https://github.com/infra-geo-ouverte/igo2-lib/commit/abdd8813865b58ab08ca82ed00b18aa2882caae1))
- **auth:** httpHeader class are immutable objects ([72c51d0](https://github.com/infra-geo-ouverte/igo2-lib/commit/72c51d009aa5a887b4bec36ccd476b64ac407e35))
- **context:** pass object to service instead of json.stringify ([2a54c62](https://github.com/infra-geo-ouverte/igo2-lib/commit/2a54c62e981f226ec67cf36303a2db4c7d71354b))
- **draw:** drawing popup label changed ([#820](https://github.com/infra-geo-ouverte/igo2-lib/issues/820)) ([d2227b9](https://github.com/infra-geo-ouverte/igo2-lib/commit/d2227b95c06f35b903a5d6ea17676fa174ee4380)), closes [#645](https://github.com/infra-geo-ouverte/igo2-lib/issues/645) [#646](https://github.com/infra-geo-ouverte/igo2-lib/issues/646)
- **options-api:** fix when layerOptions is undefined ([2255c5b](https://github.com/infra-geo-ouverte/igo2-lib/commit/2255c5b266d64ece14476fca2b1430e9c0c58747))

## [1.6.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.6.2...1.6.3) (2021-02-23)

### Bug Fixes

- **datasource:** standardize the URL when generating the id ([bb3fdba](https://github.com/infra-geo-ouverte/igo2-lib/commit/bb3fdba6de7557244e0a237d7e96e4a602856fe2))

## [1.6.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.6.1...1.6.2) (2021-02-15)

### Bug Fixes

- **catalog:** esri rest catalog were showing group as layer. ([#808](https://github.com/infra-geo-ouverte/igo2-lib/issues/808)) ([f431f47](https://github.com/infra-geo-ouverte/igo2-lib/commit/f431f47e0d33be4958c77cedf779346ed24e50c9))
- **print:** subtitle newline image format fix ([#809](https://github.com/infra-geo-ouverte/igo2-lib/issues/809)) ([5a9fe42](https://github.com/infra-geo-ouverte/igo2-lib/commit/5a9fe42761bf586444d65d714f8a7d7a1698d1aa))

### Features

- **layers-list:** add removable option ([483a7f4](https://github.com/infra-geo-ouverte/igo2-lib/commit/483a7f4621768dd92a5fafa96991b43be7ce146d))

## [1.6.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.6.0...1.6.1) (2021-02-02)

### Bug Fixes

- **layerContextDirective.computeLayerVisibilityFromUrl:** share link bug with layer id numeric ([#807](https://github.com/infra-geo-ouverte/igo2-lib/issues/807)) ([158a7a6](https://github.com/infra-geo-ouverte/igo2-lib/commit/158a7a60b9d826cbc310947ae8e82c6bf8c836ea))
- **typo:** font-size is overwrited ([bb7e601](https://github.com/infra-geo-ouverte/igo2-lib/commit/bb7e60126e86ac8d01ad320f03fa6a4b74fbd09e))

# [1.6.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.5.3...1.6.0) (2021-02-01)

### Bug Fixes

- **entity-table:** fix paginator undefined ([03f7bdc](https://github.com/infra-geo-ouverte/igo2-lib/commit/03f7bdc27626a2b72e4c957f8842e4df4489683d))
- fix unsafe external link ([f464fc6](https://github.com/infra-geo-ouverte/igo2-lib/commit/f464fc63ff5ea18c9b6d996bcd4364153b067b65))
- **forcedProperties:** add ICatalog forced properties attribute ([#803](https://github.com/infra-geo-ouverte/igo2-lib/issues/803)) ([1a5b98f](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a5b98f97676d0489f9f842b634e85e5e08584a6))
- **geometry-form-field:** fix map undefined when drawStyle changed ([fb18e82](https://github.com/infra-geo-ouverte/igo2-lib/commit/fb18e829fb5da5377e1ef4c639b4fe479e6b4a0f))
- **icherche:** geometry null ([4c7e1f9](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c7e1f99c73af3176d4b4f130a5e6dd33f797cc4))
- **intercept:** add url to xhr request interception ([#785](https://github.com/infra-geo-ouverte/igo2-lib/issues/785)) ([bf80109](https://github.com/infra-geo-ouverte/igo2-lib/commit/bf8010901ef08768fedb4fa5cd03dec1a3913afa))
- **print:** center title, fix margins and add subtitle ([#805](https://github.com/infra-geo-ouverte/igo2-lib/issues/805)) ([8efa97f](https://github.com/infra-geo-ouverte/igo2-lib/commit/8efa97f1cf2f942ec88ad21a8e164cd8b2b2992d))
- provide hashtags for search and add eye into filter tool ([#789](https://github.com/infra-geo-ouverte/igo2-lib/issues/789)) ([7b45d3b](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b45d3bb3ff8b33e9fd38b411bd0695f808ebd3c))
- **search:** No provider for SearchSourceService in somes cases [#786](https://github.com/infra-geo-ouverte/igo2-lib/issues/786) ([76748c4](https://github.com/infra-geo-ouverte/igo2-lib/commit/76748c48f928951ec3c7cf2f8c9bcdce66d44c42))
- **spatial filter:** Spatial filter1.6 ([#783](https://github.com/infra-geo-ouverte/igo2-lib/issues/783)) ([a1d0534](https://github.com/infra-geo-ouverte/igo2-lib/commit/a1d0534dfc7e5ed988959a9a3ae94bc7e80b8d2f))
- **spatial-filter:** fix radius and buffer sending ([#788](https://github.com/infra-geo-ouverte/igo2-lib/issues/788)) ([e08500e](https://github.com/infra-geo-ouverte/igo2-lib/commit/e08500eaa9ca439431529eaabe25d9b0668b91a2))
- **spatial-filter:** Generic type NestedTreeControl<T> requires 1 type argument ([79e2828](https://github.com/infra-geo-ouverte/igo2-lib/commit/79e28286b8f413cbe9419d522a697ceab5892e7d))
- **wfs:** fix url with ? ([aa7a973](https://github.com/infra-geo-ouverte/igo2-lib/commit/aa7a973f29559a5eabc0bbd56538292173f6cc4a))

### Features

- **about-tool:** add IGO2 training guide ([#790](https://github.com/infra-geo-ouverte/igo2-lib/issues/790)) ([36b18b0](https://github.com/infra-geo-ouverte/igo2-lib/commit/36b18b06dece3f2e62dc5384c6d69d03421cca78))
- **catalog:** allow alias to force name on catalog's layer ([#787](https://github.com/infra-geo-ouverte/igo2-lib/issues/787)) ([c392912](https://github.com/infra-geo-ouverte/igo2-lib/commit/c392912293a910ec8ff6a501f2b21c14529120ef))
- **catalog:** allow to use abstract a meta when metadata url is undefined ([#799](https://github.com/infra-geo-ouverte/igo2-lib/issues/799)) ([7535b09](https://github.com/infra-geo-ouverte/igo2-lib/commit/7535b096a0a6b8405bb05bfcb9ac2479d2de81c5))
- **draw:** new draw tool ([#795](https://github.com/infra-geo-ouverte/igo2-lib/issues/795)) ([dac05d2](https://github.com/infra-geo-ouverte/igo2-lib/commit/dac05d23f350724110a0853655f8860098551a0c))
- **form:** allows user to specify validator option for form field configuration as string value ([47b00d2](https://github.com/infra-geo-ouverte/igo2-lib/commit/47b00d2890b74b2a0a1dee1bb3d638f8c567063a))
- **interactive:** map interactive tour ([#781](https://github.com/infra-geo-ouverte/igo2-lib/issues/781)) ([ee37f12](https://github.com/infra-geo-ouverte/igo2-lib/commit/ee37f12b6cd9c7a5eac0b177e6595e1096447340))

## [1.5.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.5.2...1.5.3) (2020-11-19)

### Bug Fixes

- **flexible:** Cannot read property unsubscribe of undefined ([bdec1d5](https://github.com/infra-geo-ouverte/igo2-lib/commit/bdec1d59b2a443f8bd7783fd8ecbbd54743637a8))
- **print-tool:** fix small screen layers print ([#780](https://github.com/infra-geo-ouverte/igo2-lib/issues/780)) ([9e404fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/9e404fe9817ae571498ebd2dc352c22a778493b2))
- **print:** the legend was called twice and improvement of its positioning ([1ea159c](https://github.com/infra-geo-ouverte/igo2-lib/commit/1ea159c12ef9badc9a01f079ff082c14e2d368dc))
- **workspace:** WMS workspace with a different url for wms-wfs is not correctly assigned. ([#778](https://github.com/infra-geo-ouverte/igo2-lib/issues/778)) ([c16a1c9](https://github.com/infra-geo-ouverte/igo2-lib/commit/c16a1c91f263f486663db6e7427095f4fdf8520c))

### Features

- **hover:** Hover feature ([#779](https://github.com/infra-geo-ouverte/igo2-lib/issues/779)) ([aa182ec](https://github.com/infra-geo-ouverte/igo2-lib/commit/aa182ecb90d213e00edbc70d957922aba7b4a7f4)), closes [#773](https://github.com/infra-geo-ouverte/igo2-lib/issues/773) [#765](https://github.com/infra-geo-ouverte/igo2-lib/issues/765)
- **tour:** Context interactive tour ([#751](https://github.com/infra-geo-ouverte/igo2-lib/issues/751)) ([09826e6](https://github.com/infra-geo-ouverte/igo2-lib/commit/09826e60ac6d5583192848339e05f1a0f5f6537c))

## [1.5.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.5.1...1.5.2) (2020-11-11)

### Bug Fixes

- **actionbar:** chevrons are now relative to igo div ([2019da3](https://github.com/infra-geo-ouverte/igo2-lib/commit/2019da3752eff916bbfda2e6fcb6bb55d2173b13))
- **drap-drow:** drop event is fired twice ([5f36c8b](https://github.com/infra-geo-ouverte/igo2-lib/commit/5f36c8ba6a123716a4ae90864f45f08039b2a429))
- **locale:** fix merge locales ([6e6e843](https://github.com/infra-geo-ouverte/igo2-lib/commit/6e6e843019870e2238a0750bb6493ad4800fe57a))
- **ogc-filter-form:** applied projection and change field on typing ([#760](https://github.com/infra-geo-ouverte/igo2-lib/issues/760)) ([66e894f](https://github.com/infra-geo-ouverte/igo2-lib/commit/66e894f7737eb3ab175d5ac6a0756187151aff3c))
- **print:** fix legend print ([571fa31](https://github.com/infra-geo-ouverte/igo2-lib/commit/571fa315bc6a6dca529ed301ff63098137bb9293))
- **print:** fix print legend ([ad7d121](https://github.com/infra-geo-ouverte/igo2-lib/commit/ad7d1219c193bf7b3304a6bff7514e5f1a3d297c))
- **print:** print legend icon ([#772](https://github.com/infra-geo-ouverte/igo2-lib/issues/772)) ([228543f](https://github.com/infra-geo-ouverte/igo2-lib/commit/228543f1e75c77aa3d9c913e6aa886008d121177))
- **spatial-filter:** Spatial filter1.5.2 - in progress ([#769](https://github.com/infra-geo-ouverte/igo2-lib/issues/769)) ([bf7d7a6](https://github.com/infra-geo-ouverte/igo2-lib/commit/bf7d7a62011987dfc72ab5bfaefea5475dea9e20))
- **spinner:** the directive created a new component instead of using the associated one ([b049a96](https://github.com/infra-geo-ouverte/igo2-lib/commit/b049a96a2cad8f00a4600d5849810a0ed4318bd0))
- **stringToLonLat:** negative DNS now returns the correct coordinate and DMS regex stricter ([e5fabd5](https://github.com/infra-geo-ouverte/igo2-lib/commit/e5fabd57295535cf5e2254cb2ec15f735fb8a6f4))
- **workspace:** CSS modifs for actionbar menu ([#766](https://github.com/infra-geo-ouverte/igo2-lib/issues/766)) ([8156bce](https://github.com/infra-geo-ouverte/igo2-lib/commit/8156bce09f6aa8896bf5901e2c6b8974fb1e0f5b))

### Features

- **icherche:** add types ([f5097a1](https://github.com/infra-geo-ouverte/igo2-lib/commit/f5097a14a80e1ca55365aff50e2428e03a7a99db))
- **layer:** Bindind layers together (some identified properties and deletion) ([#720](https://github.com/infra-geo-ouverte/igo2-lib/issues/720)) ([7e44659](https://github.com/infra-geo-ouverte/igo2-lib/commit/7e44659d37d6850637a0067a42fb783699546934)), closes [#580](https://github.com/infra-geo-ouverte/igo2-lib/issues/580) [#581](https://github.com/infra-geo-ouverte/igo2-lib/issues/581) [#586](https://github.com/infra-geo-ouverte/igo2-lib/issues/586) [#582](https://github.com/infra-geo-ouverte/igo2-lib/issues/582) [#583](https://github.com/infra-geo-ouverte/igo2-lib/issues/583) [#595](https://github.com/infra-geo-ouverte/igo2-lib/issues/595) [#589](https://github.com/infra-geo-ouverte/igo2-lib/issues/589) [#588](https://github.com/infra-geo-ouverte/igo2-lib/issues/588) [#602](https://github.com/infra-geo-ouverte/igo2-lib/issues/602) [#597](https://github.com/infra-geo-ouverte/igo2-lib/issues/597) [#603](https://github.com/infra-geo-ouverte/igo2-lib/issues/603) [#607](https://github.com/infra-geo-ouverte/igo2-lib/issues/607) [#585](https://github.com/infra-geo-ouverte/igo2-lib/issues/585) [#611](https://github.com/infra-geo-ouverte/igo2-lib/issues/611) [#610](https://github.com/infra-geo-ouverte/igo2-lib/issues/610) [#609](https://github.com/infra-geo-ouverte/igo2-lib/issues/609) [#608](https://github.com/infra-geo-ouverte/igo2-lib/issues/608) [#612](https://github.com/infra-geo-ouverte/igo2-lib/issues/612) [#620](https://github.com/infra-geo-ouverte/igo2-lib/issues/620) [#617](https://github.com/infra-geo-ouverte/igo2-lib/issues/617) [#618](https://github.com/infra-geo-ouverte/igo2-lib/issues/618) [#359](https://github.com/infra-geo-ouverte/igo2-lib/issues/359) [#619](https://github.com/infra-geo-ouverte/igo2-lib/issues/619) [#359](https://github.com/infra-geo-ouverte/igo2-lib/issues/359) [#621](https://github.com/infra-geo-ouverte/igo2-lib/issues/621) [#614](https://github.com/infra-geo-ouverte/igo2-lib/issues/614) [#624](https://github.com/infra-geo-ouverte/igo2-lib/issues/624) [#623](https://github.com/infra-geo-ouverte/igo2-lib/issues/623) [#599](https://github.com/infra-geo-ouverte/igo2-lib/issues/599) [#625](https://github.com/infra-geo-ouverte/igo2-lib/issues/625) [#632](https://github.com/infra-geo-ouverte/igo2-lib/issues/632) [#629](https://github.com/infra-geo-ouverte/igo2-lib/issues/629) [#628](https://github.com/infra-geo-ouverte/igo2-lib/issues/628) [#631](https://github.com/infra-geo-ouverte/igo2-lib/issues/631) [#616](https://github.com/infra-geo-ouverte/igo2-lib/issues/616) [#635](https://github.com/infra-geo-ouverte/igo2-lib/issues/635) [#636](https://github.com/infra-geo-ouverte/igo2-lib/issues/636) [#637](https://github.com/infra-geo-ouverte/igo2-lib/issues/637) [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#700](https://github.com/infra-geo-ouverte/igo2-lib/issues/700) [#701](https://github.com/infra-geo-ouverte/igo2-lib/issues/701) [#703](https://github.com/infra-geo-ouverte/igo2-lib/issues/703) [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#707](https://github.com/infra-geo-ouverte/igo2-lib/issues/707) [#702](https://github.com/infra-geo-ouverte/igo2-lib/issues/702) [#709](https://github.com/infra-geo-ouverte/igo2-lib/issues/709) [#708](https://github.com/infra-geo-ouverte/igo2-lib/issues/708) [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#700](https://github.com/infra-geo-ouverte/igo2-lib/issues/700) [#701](https://github.com/infra-geo-ouverte/igo2-lib/issues/701) [#703](https://github.com/infra-geo-ouverte/igo2-lib/issues/703) [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#707](https://github.com/infra-geo-ouverte/igo2-lib/issues/707) [#702](https://github.com/infra-geo-ouverte/igo2-lib/issues/702) [#709](https://github.com/infra-geo-ouverte/igo2-lib/issues/709) [#708](https://github.com/infra-geo-ouverte/igo2-lib/issues/708) [#750](https://github.com/infra-geo-ouverte/igo2-lib/issues/750)
- **spatial-filter:** add buffer and units option ([#761](https://github.com/infra-geo-ouverte/igo2-lib/issues/761)) ([487fac2](https://github.com/infra-geo-ouverte/igo2-lib/commit/487fac240d990737432da91413d9a8207ccead57))
- **translate:** can load many locale files ([c0cf6cb](https://github.com/infra-geo-ouverte/igo2-lib/commit/c0cf6cb4620235264c59bc4092cd22cce67ac552))

## [1.5.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.5.0...1.5.1) (2020-10-20)

### Bug Fixes

- **timeFilter:** getCapabilies populates the timeFilter ([41dbd1f](https://github.com/infra-geo-ouverte/igo2-lib/commit/41dbd1fb56afc4a6da1a12e2268ba5277ca77821))

# [1.5.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.4.3...1.5.0) (2020-10-16)

### Bug Fixes

- **arcgisrest datasource:** Fix id generator for arcgis rest catalog + add demo example ([#715](https://github.com/infra-geo-ouverte/igo2-lib/issues/715)) ([b2b6beb](https://github.com/infra-geo-ouverte/igo2-lib/commit/b2b6beb15651f552dd114f573f85fd002dd8f539))
- **auth:** auth microsoft use location href ([94aaec1](https://github.com/infra-geo-ouverte/igo2-lib/commit/94aaec17b707d860db357e5a8f71d93f4afdb0a4))
- **auth:** trustHosts now working ([b29ac99](https://github.com/infra-geo-ouverte/igo2-lib/commit/b29ac99a1d1a61c74d086b091e142c40568c5bca))
- **capabilities.service:** Access denied err handling ([#717](https://github.com/infra-geo-ouverte/igo2-lib/issues/717)) ([4a4c736](https://github.com/infra-geo-ouverte/igo2-lib/commit/4a4c736af0f8dc96e230f88dbd9358cff95ee0ee))
- **catalog:** preview conflict with layer add ([#722](https://github.com/infra-geo-ouverte/igo2-lib/issues/722)) ([6416022](https://github.com/infra-geo-ouverte/igo2-lib/commit/64160227574d7fd00d58ee13ffa081ce7101fa0b))
- **context-export:** keep the order of the layers coming from catalogs or search ([4e3dd07](https://github.com/infra-geo-ouverte/igo2-lib/commit/4e3dd070f80dc7de1765fc9ea9c03b58fffdfbf0))
- **demo:** remove pointerPositionByKey ([7fd2d74](https://github.com/infra-geo-ouverte/igo2-lib/commit/7fd2d74395d5266c8b2cfd9fe92121136297956b))
- **directions:** copy link, multi/polygon proposal ([#733](https://github.com/infra-geo-ouverte/igo2-lib/issues/733)) ([1e2177d](https://github.com/infra-geo-ouverte/igo2-lib/commit/1e2177d8e822e6c3eadd7c6097f4c0d886074700))
- **export:** fix encoding ex;l and google maps name link ([#712](https://github.com/infra-geo-ouverte/igo2-lib/issues/712)) ([244416d](https://github.com/infra-geo-ouverte/igo2-lib/commit/244416db1472f4f7effe2004cfb8a7551fdbdb3c)), closes [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696)
- **feature-details:** fix routing property when directions tool out of config ([#745](https://github.com/infra-geo-ouverte/igo2-lib/issues/745)) ([4d8618b](https://github.com/infra-geo-ouverte/igo2-lib/commit/4d8618bdd5bd85399281af5cbddcd32544e9a824))
- **geolocate:** geolocate always track the position ([8368057](https://github.com/infra-geo-ouverte/igo2-lib/commit/8368057602b92bbdb391e0b1cc96dddc84f8de7d))
- **igoPointerPositionByKey:** remove directive not used ([8fd4b09](https://github.com/infra-geo-ouverte/igo2-lib/commit/8fd4b09bae94c4ee023893bacb01431fc4616287))
- **interactive-tour:** css fix for interactive tour ([#708](https://github.com/infra-geo-ouverte/igo2-lib/issues/708)) ([6fa80f4](https://github.com/infra-geo-ouverte/igo2-lib/commit/6fa80f437b40cd431423386210cad4beec607b06))
- **interactive-tour:** fix missing element condition ([#730](https://github.com/infra-geo-ouverte/igo2-lib/issues/730)) ([720a0d0](https://github.com/infra-geo-ouverte/igo2-lib/commit/720a0d087324185def1b004c5426ce270477ca66))
- **legend:** fix stylesAvailable undefined ([ea1952e](https://github.com/infra-geo-ouverte/igo2-lib/commit/ea1952e2369fb7229b1cbd388d56ed6e9a307eb4))
- **legend:** legend close on return in map ([#517](https://github.com/infra-geo-ouverte/igo2-lib/issues/517)) ([#736](https://github.com/infra-geo-ouverte/igo2-lib/issues/736)) ([847029d](https://github.com/infra-geo-ouverte/igo2-lib/commit/847029dfd1f57a1aaf9bf382051f3673ac372c51))
- **spatial-filter:** fix spatial filter 1.4 ([#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697)) ([7180323](https://github.com/infra-geo-ouverte/igo2-lib/commit/71803233a25f1a4a52a04d3e4270eb6c4df9e1b6))
- **spatial-filter:** fix spatial filter results according to expansio… ([#727](https://github.com/infra-geo-ouverte/igo2-lib/issues/727)) ([51c826b](https://github.com/infra-geo-ouverte/igo2-lib/commit/51c826b61f951ed65994f8f0ea16879ac3808294))
- **spatial-filter:** fix workspace results ([#734](https://github.com/infra-geo-ouverte/igo2-lib/issues/734)) ([349f021](https://github.com/infra-geo-ouverte/igo2-lib/commit/349f0213a1baa75ef35367f0655820843dab5f60))
- **view:** constrain resolutions ([be77ec8](https://github.com/infra-geo-ouverte/igo2-lib/commit/be77ec8b8a9945c23f6c7fb644aabec104888e96))

### Features

- **auth:** add microsoft azure authentification ([055cb7f](https://github.com/infra-geo-ouverte/igo2-lib/commit/055cb7fac88b7e0d3b1ed11bc87aad79a46d1321))
- **badge-icon:** manage color, disabled and invert colors ([96dada8](https://github.com/infra-geo-ouverte/igo2-lib/commit/96dada88cba43fe28809628ed51c754a5c4caef7))
- **badge:** add inherit color and change layer-list filter icon ([7570040](https://github.com/infra-geo-ouverte/igo2-lib/commit/7570040f4169c735390a7473e681eed92c9ec699))
- **catalog:** arcgis rest data catalog ([#709](https://github.com/infra-geo-ouverte/igo2-lib/issues/709)) ([db658d7](https://github.com/infra-geo-ouverte/igo2-lib/commit/db658d718cf9d410f98f2a5b2beb32567c507b99))
- **entity-table:** add pagination ([#707](https://github.com/infra-geo-ouverte/igo2-lib/issues/707)) ([7ca6be8](https://github.com/infra-geo-ouverte/igo2-lib/commit/7ca6be8cdfdfb9c8a122fdc6ca3657b6b7f47782)), closes [#702](https://github.com/infra-geo-ouverte/igo2-lib/issues/702)
- **feature-details:** add routing directive to access route from directions tool ([#711](https://github.com/infra-geo-ouverte/igo2-lib/issues/711)) ([e32f102](https://github.com/infra-geo-ouverte/igo2-lib/commit/e32f102b0dcd8ef8d2183f86a7d88b4c47c1e10d))
- **feature-details:** show images in feature-details ([2b96972](https://github.com/infra-geo-ouverte/igo2-lib/commit/2b969720174cd4500d5753252fcbeb8b8379ec9e))
- **filter:** add ogc tim filter ([#705](https://github.com/infra-geo-ouverte/igo2-lib/issues/705)) ([496e9bb](https://github.com/infra-geo-ouverte/igo2-lib/commit/496e9bb1381cd0e46515263859170d5abe8cbcf9)), closes [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#700](https://github.com/infra-geo-ouverte/igo2-lib/issues/700) [#701](https://github.com/infra-geo-ouverte/igo2-lib/issues/701) [#506](https://github.com/infra-geo-ouverte/igo2-lib/issues/506)
- **icherche:** add route property ([#740](https://github.com/infra-geo-ouverte/igo2-lib/issues/740)) ([6ca26e7](https://github.com/infra-geo-ouverte/igo2-lib/commit/6ca26e7a95432522e402bf97b23741eff569eca8))
- **interactive-tour:** add config + handling error no configtourFile ([#746](https://github.com/infra-geo-ouverte/igo2-lib/issues/746)) ([eff4335](https://github.com/infra-geo-ouverte/igo2-lib/commit/eff4335d4459b119370c98d1263fc6c03d7d9f47))
- **interactive-tour:** Disabled and tooltip condition ([#731](https://github.com/infra-geo-ouverte/igo2-lib/issues/731)) ([c579280](https://github.com/infra-geo-ouverte/igo2-lib/commit/c5792805825166f547e3bf9feadb70c9082e67bc))
- **interactive-tour:** skip step if element attach is not found and add mat-typography class ([#723](https://github.com/infra-geo-ouverte/igo2-lib/issues/723)) ([3f143d7](https://github.com/infra-geo-ouverte/igo2-lib/commit/3f143d743cf2d32f9d2a498b75f2a854078758a7))
- **interactiveTour + welcomeWindows:** add new component and service ([#701](https://github.com/infra-geo-ouverte/igo2-lib/issues/701)) ([9bfedbc](https://github.com/infra-geo-ouverte/igo2-lib/commit/9bfedbcbfd43be76e18a08b623fa890ee6c12e08))
- **layer-list:** add eye in multiple selection to activate or deactivate selected layers ([#714](https://github.com/infra-geo-ouverte/igo2-lib/issues/714)) ([1248fd5](https://github.com/infra-geo-ouverte/igo2-lib/commit/1248fd58a14eadee30e8f44aa59f1f7d56d479ca))
- **libs:** upgrade librairies ([#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696)) ([0c0fd83](https://github.com/infra-geo-ouverte/igo2-lib/commit/0c0fd83da0e911125e8fa932b8cac286626898c5))
- **search-bar:** can set appearance and map is optional ([1d083f4](https://github.com/infra-geo-ouverte/igo2-lib/commit/1d083f4a5fa32075c9f04da5ec1792543f7270dc))
- **search-bar:** dynamic placeholder according to the type of search ([30484f4](https://github.com/infra-geo-ouverte/igo2-lib/commit/30484f4c60fe8a811b2e89059992d8558e8dbe17))
- **search-state:** add selected result property ([#744](https://github.com/infra-geo-ouverte/igo2-lib/issues/744)) ([1a701ab](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a701abfd7d756329946389aa53cafb35baa69ed))
- **search:** add help in search-result ([666244d](https://github.com/infra-geo-ouverte/igo2-lib/commit/666244d5aa2630e0ecd99ad4c774ed579eb4d421))
- **vector-layer:** add authInterceptor for vector and vectortile layers ([#719](https://github.com/infra-geo-ouverte/igo2-lib/issues/719)) ([3cdd84b](https://github.com/infra-geo-ouverte/igo2-lib/commit/3cdd84b4ecb179777df576a716bba6b4b89b28d6))
- **version:** release date constant ([#735](https://github.com/infra-geo-ouverte/igo2-lib/issues/735)) ([2b93269](https://github.com/infra-geo-ouverte/igo2-lib/commit/2b93269d7818eb3a8c8ee4a19349c4f72a8f18bc))
- **workspace:** enabling table view for vector layers ([#667](https://github.com/infra-geo-ouverte/igo2-lib/issues/667)) ([66e5d83](https://github.com/infra-geo-ouverte/igo2-lib/commit/66e5d8360f7c027bad4eaebf1f00c5ef58bc2974)), closes [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#700](https://github.com/infra-geo-ouverte/igo2-lib/issues/700) [#701](https://github.com/infra-geo-ouverte/igo2-lib/issues/701) [#703](https://github.com/infra-geo-ouverte/igo2-lib/issues/703) [#696](https://github.com/infra-geo-ouverte/igo2-lib/issues/696) [#697](https://github.com/infra-geo-ouverte/igo2-lib/issues/697) [#707](https://github.com/infra-geo-ouverte/igo2-lib/issues/707) [#702](https://github.com/infra-geo-ouverte/igo2-lib/issues/702) [#709](https://github.com/infra-geo-ouverte/igo2-lib/issues/709) [#708](https://github.com/infra-geo-ouverte/igo2-lib/issues/708)

## [1.4.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.4.2...1.4.3) (2020-09-08)

### Bug Fixes

- **context-list:** profils are checked by defaults ([b1a7171](https://github.com/infra-geo-ouverte/igo2-lib/commit/b1a71712a43fb71b3c2561d55c99ffe0631f30a3))
- **geometry:** fix performance issue when drawing multiple holes in a polygon ([5af7249](https://github.com/infra-geo-ouverte/igo2-lib/commit/5af724975b0f9603f9a77794f7beeea68f2a7fa7))
- **geometry:** properly compute the draw guide style when the draw style is an array ([8087029](https://github.com/infra-geo-ouverte/igo2-lib/commit/8087029fafd08fc6cf73dd3b2770b43853b5a40c))
- layer and modify control issues ([3be1301](https://github.com/infra-geo-ouverte/igo2-lib/commit/3be1301ee88aefd15564259783b2e71f0c290c39))
- **layer:** fix issue with remove layer index ([cb7c1b9](https://github.com/infra-geo-ouverte/igo2-lib/commit/cb7c1b9c95873124bb7d97158acc7cba7c7bdf1c))
- **modify:** modify performance issue caused by the drag box interaction ([47fc2e8](https://github.com/infra-geo-ouverte/igo2-lib/commit/47fc2e8e41395b0034922ba685ca28b90d28f13f))
- **transaction:** when an entity is updated more than once, always keep a reference to the original entity ([1fd0eb7](https://github.com/infra-geo-ouverte/igo2-lib/commit/1fd0eb716e52f47ab94aabb5e5aaaeeb8c97efc5))

### Features

- **form:** add a method to get a form field by name ([bb0e1bd](https://github.com/infra-geo-ouverte/igo2-lib/commit/bb0e1bda2bd5efc1460b0d06fad001bd4b03fa30))
- **geometry:** allow control options to be passed and translation to be disabled ([61835ab](https://github.com/infra-geo-ouverte/igo2-lib/commit/61835ab3d13ce49fc1174d304afcf96625a7c610))
- **layer:** layers can have an alias ([986dac5](https://github.com/infra-geo-ouverte/igo2-lib/commit/986dac5258019f6f91a250eb43d5bd29a4034e0e))
- **selection:** add a way to deactivate the selection without removing the selection overlay ([a61ce05](https://github.com/infra-geo-ouverte/igo2-lib/commit/a61ce05d2ee433720facdec532721d642b6f5c3b))
- **strategy:** add a method to set a strategy's feature motion ([bb6be2d](https://github.com/infra-geo-ouverte/igo2-lib/commit/bb6be2db4a9e8fbf74b7038fd0c3f8c9d733f8b0))

## [1.4.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.4.1...1.4.2) (2020-08-04)

## [1.4.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.4.0...1.4.1) (2020-08-04)

# [1.4.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.3.1...1.4.0) (2020-08-04)

### Bug Fixes

- **context-manager:** LayerContextDirective supports all income routes ([#650](https://github.com/infra-geo-ouverte/igo2-lib/issues/650)) ([7c9625f](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c9625fe2730c313abdb0fae65d05133360847f0))
- **context:** load default context when context is invalid ([42d7baf](https://github.com/infra-geo-ouverte/igo2-lib/commit/42d7baf3bb6a879384bd8f7c4f46b8f91c299074))
- **context:** show button only if connected ([1fb7848](https://github.com/infra-geo-ouverte/igo2-lib/commit/1fb7848f37a9b525dab0869a9465b9124eb1888d))
- **export:** GPX export integrates MultiLineString geometry ([#660](https://github.com/infra-geo-ouverte/igo2-lib/issues/660)) ([7a26ddc](https://github.com/infra-geo-ouverte/igo2-lib/commit/7a26ddc48cf2c15f8f8dff306eb37404139da69e))
- **export:** URL translation and layer remove from map ([#691](https://github.com/infra-geo-ouverte/igo2-lib/issues/691)) ([764c70b](https://github.com/infra-geo-ouverte/igo2-lib/commit/764c70b8577f8ca3b0e86362c29c27209e39bee2))
- **GoogleMapsLink:** fix line and polygon google maps link ([#682](https://github.com/infra-geo-ouverte/igo2-lib/issues/682)) ([3cbe9fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/3cbe9fec87cf2d8edaf5bbd357219161439f01fb))
- **importExport:** Skip while exportOptions undefined ([#659](https://github.com/infra-geo-ouverte/igo2-lib/issues/659)) ([f95d7d4](https://github.com/infra-geo-ouverte/igo2-lib/commit/f95d7d4bb387e82f2488e5677469d902727c32b2))
- **query:** html target = iframe for HTMLGML2 ([6a4ac45](https://github.com/infra-geo-ouverte/igo2-lib/commit/6a4ac450313156414843612dc3e2b0cec9c865a0))
- **search-results:** remove previous selection with new selection ([#681](https://github.com/infra-geo-ouverte/igo2-lib/issues/681)) ([95c0583](https://github.com/infra-geo-ouverte/igo2-lib/commit/95c0583135bf01003f57a9359e29a23f408bdc94))
- **search-results:** smoother search update ([29bf796](https://github.com/infra-geo-ouverte/igo2-lib/commit/29bf7969ae5af1179a7e16fb46958cb9d298e6de))

### Features

- **context:** Context hiding ([#680](https://github.com/infra-geo-ouverte/igo2-lib/issues/680)) ([d9052de](https://github.com/infra-geo-ouverte/igo2-lib/commit/d9052defab0f37f467e7ff625ba9db66e5be9ac2))
- **context:** copy context id ([d3391e6](https://github.com/infra-geo-ouverte/igo2-lib/commit/d3391e6273f0c42c9dff547b8e69f5148fafb9c2))
- **context:** filter context by user + autocomplete on permissions adding ([#664](https://github.com/infra-geo-ouverte/igo2-lib/issues/664)) ([e4967ca](https://github.com/infra-geo-ouverte/igo2-lib/commit/e4967caa17b428b50fc64f2e916c75db9a8a3395))
- **context:** Import export context ([#693](https://github.com/infra-geo-ouverte/igo2-lib/issues/693)) ([f644956](https://github.com/infra-geo-ouverte/igo2-lib/commit/f6449567b5b86eadd17c12b37984e5f49d0d50e7))
- **context:** read only context can revoke permission if the context is shared directly ([95e7c5b](https://github.com/infra-geo-ouverte/igo2-lib/commit/95e7c5b7ab2df59cc51d0dba9ec4a003141fda50))
- **export:** Allow the CSV semicolon delimiter export format ([#668](https://github.com/infra-geo-ouverte/igo2-lib/issues/668)) ([95bf271](https://github.com/infra-geo-ouverte/igo2-lib/commit/95bf2716900068e4ff53a19e7c5a106ddcc353f8))
- **export:** multiple layers ([#692](https://github.com/infra-geo-ouverte/igo2-lib/issues/692)) ([5e02471](https://github.com/infra-geo-ouverte/igo2-lib/commit/5e02471fe91197ad766a631ffbfb67913f59c21d))
- **import-export:** enhancement: add export in extent only, save selected tab and options ([#657](https://github.com/infra-geo-ouverte/igo2-lib/issues/657)) ([e308859](https://github.com/infra-geo-ouverte/igo2-lib/commit/e308859f9df93bc4a5a342a5b910dc48bc914f35))
- **import:** clusterStyle in default style for importWithStyle ([#649](https://github.com/infra-geo-ouverte/igo2-lib/issues/649)) ([85335ed](https://github.com/infra-geo-ouverte/igo2-lib/commit/85335edd4e4c270fe70320e8eb69a8dfd444ca1e))
- **importExport:** new export method by URL (based on download property) ([#661](https://github.com/infra-geo-ouverte/igo2-lib/issues/661)) ([f1af5ed](https://github.com/infra-geo-ouverte/igo2-lib/commit/f1af5ed8d5393c0b8021cdc563c9919a5aedd82c))
- **map:** geolocation follower ([#648](https://github.com/infra-geo-ouverte/igo2-lib/issues/648)) ([edabdd7](https://github.com/infra-geo-ouverte/igo2-lib/commit/edabdd7e91e60029fe5a3a0d7f61e39590be4b53))
- **print:** print Ionic service ([#685](https://github.com/infra-geo-ouverte/igo2-lib/issues/685)) ([56dbb84](https://github.com/infra-geo-ouverte/igo2-lib/commit/56dbb84ec8d5083956cff9240316f37a132d1bc7))
- **query-params:** Allow the user to add layer from URL (données Québec) ([#690](https://github.com/infra-geo-ouverte/igo2-lib/issues/690)) ([87eed27](https://github.com/infra-geo-ouverte/igo2-lib/commit/87eed27a6a7ea4a6e107b14c4c1da669df4179fc))
- **spatial-filter:** link spatial filter to export tool ([#662](https://github.com/infra-geo-ouverte/igo2-lib/issues/662)) ([2ac67f1](https://github.com/infra-geo-ouverte/igo2-lib/commit/2ac67f151d4d03d06141ce9e62b1382c120f7e1e))
- **storage:** add storage service ([25c033d](https://github.com/infra-geo-ouverte/igo2-lib/commit/25c033d02b39026f6396b4451550f4fa296d04e7))
- **user-agent:** add service to detect browser and os ([9902593](https://github.com/infra-geo-ouverte/igo2-lib/commit/9902593bb6a3d15ad9f2eec4e8436ff6dfc1f887))
- **vector-layer:** add clusterBaseStyle attribute ([#666](https://github.com/infra-geo-ouverte/igo2-lib/issues/666)) ([2ffd570](https://github.com/infra-geo-ouverte/igo2-lib/commit/2ffd57018fe87d60cd3bb6b17dff3ca100173f73))

## [1.3.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.3.0...1.3.1) (2020-06-01)

### Bug Fixes

- **context:** limit length title context ([88de4ee](https://github.com/infra-geo-ouverte/igo2-lib/commit/88de4ee4c836ef61a85386cf0a2c4060650129be))
- **context:** reset z-index ([64c2861](https://github.com/infra-geo-ouverte/igo2-lib/commit/64c2861738681baa32900a382ad260de32d40990))
- **datasource:** optionsFromApi disabled by default in context ([23abbe8](https://github.com/infra-geo-ouverte/igo2-lib/commit/23abbe81ea9baadab6ef9a8db88f4cbe6fa9437f))
- **getCapabilites:** nonexistent layer results in an untitled layer ([07bd348](https://github.com/infra-geo-ouverte/igo2-lib/commit/07bd34830fd86e79ffb544b1946c0033be6a022f))
- **getCapabilities:** slow request results in an unfilled list ([762f33f](https://github.com/infra-geo-ouverte/igo2-lib/commit/762f33f740a720928c50c83e356db4f3839d5a5b))
- **layer-list / export:** Fix 1.3 release ([#654](https://github.com/infra-geo-ouverte/igo2-lib/issues/654)) ([ff28783](https://github.com/infra-geo-ouverte/igo2-lib/commit/ff2878339eccf2486cd7f936ef6a688e9824da37))
- **layer-list:** sort alpha with upper cases and accent ([#647](https://github.com/infra-geo-ouverte/igo2-lib/issues/647)) ([f244e69](https://github.com/infra-geo-ouverte/igo2-lib/commit/f244e69ee99e662f269dd21ea1bb443818fa5660))
- **map:** improve zIndex management ([6657c4a](https://github.com/infra-geo-ouverte/igo2-lib/commit/6657c4a5cccf676e512cf837a0dfea67244b2113))
- **optionsApi:** remove default url ([b3eaf3b](https://github.com/infra-geo-ouverte/igo2-lib/commit/b3eaf3bc5611ba9030bbd08137c891c60e280724))
- **query:** catch GML3 error ([4c9c4fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c9c4fecd9f284c119a3da70db22959b864194b0))
- **spatial-filter:** fix polygon/line layer display ([#655](https://github.com/infra-geo-ouverte/igo2-lib/issues/655)) ([9588672](https://github.com/infra-geo-ouverte/igo2-lib/commit/95886722f06d13cadba1a5b45c1a861721c61c87))

### Features

- **export:** GPX export properties in comment by default ([8687d53](https://github.com/infra-geo-ouverte/igo2-lib/commit/8687d53ab585a48f762b9d908d9a4e3f65bb4c95))

# [1.3.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.2.0...1.3.0) (2020-05-11)

### Bug Fixes

- **catalog:** apply the regular expression on the isolated layers of the first level of the catalog ([#599](https://github.com/infra-geo-ouverte/igo2-lib/issues/599)) ([514822f](https://github.com/infra-geo-ouverte/igo2-lib/commit/514822f26d8d74674fd9e84687d581a35581cd44))
- **context:** queryable must be saved ([2085a17](https://github.com/infra-geo-ouverte/igo2-lib/commit/2085a178b89b5bd2a6865af7ac67ab36ba3487f6))
- **context:** queryable must be saved ([dba0e3e](https://github.com/infra-geo-ouverte/igo2-lib/commit/dba0e3e33dd444851f7e3c5859924d37edb68711))
- **datasource:** improve error handling ([e83a84e](https://github.com/infra-geo-ouverte/igo2-lib/commit/e83a84ebaeb3fcfb63783cfde318125130859d32))
- **demo/toast-panel:** fix spatial-filter alias in demo / resize checkbox in zoom menu feature ([#586](https://github.com/infra-geo-ouverte/igo2-lib/issues/586)) ([b9a1727](https://github.com/infra-geo-ouverte/igo2-lib/commit/b9a17271105301e3d92e60dcd0f82808f24a9340))
- **directions:** search term change and map synchronization ([#580](https://github.com/infra-geo-ouverte/igo2-lib/issues/580)) ([dc68fe3](https://github.com/infra-geo-ouverte/igo2-lib/commit/dc68fe369a628e8090fae34948c6124348fad026))
- **feature:** excludeAttribute works with offlineButton ([#628](https://github.com/infra-geo-ouverte/igo2-lib/issues/628)) ([4acfbbc](https://github.com/infra-geo-ouverte/igo2-lib/commit/4acfbbcfce8530653845770bf669fff8eea4e654))
- **layer-list:** fix baselayer with select all and opacity CSS ([#632](https://github.com/infra-geo-ouverte/igo2-lib/issues/632)) ([f57405c](https://github.com/infra-geo-ouverte/igo2-lib/commit/f57405c51a5bf631136907105e6ebe5b6d99bbec))
- **layer-list:** fix selection mode ([#635](https://github.com/infra-geo-ouverte/igo2-lib/issues/635)) ([29bac86](https://github.com/infra-geo-ouverte/igo2-lib/commit/29bac86bd4136153f210587324d132c72e8f1a10))
- **layer:** add tile-watcher to vectortile-layer ([#595](https://github.com/infra-geo-ouverte/igo2-lib/issues/595)) ([b3cb8b3](https://github.com/infra-geo-ouverte/igo2-lib/commit/b3cb8b301528d08bdea3bd6bb4a8395662c263fc))
- **layer:** prevent empty map message to be shown too quickly ([c44378b](https://github.com/infra-geo-ouverte/igo2-lib/commit/c44378bbf59c1777e3751023ebdbebf8cdf591e4))
- **layer:** updateInResolutionRange works properly if maxResolution = 0 ([#597](https://github.com/infra-geo-ouverte/igo2-lib/issues/597)) ([cb6226a](https://github.com/infra-geo-ouverte/igo2-lib/commit/cb6226aeb980845d79ffb63ffab89563310b2fe6))
- **map:** tracking fix ([#629](https://github.com/infra-geo-ouverte/igo2-lib/issues/629)) ([1c09410](https://github.com/infra-geo-ouverte/igo2-lib/commit/1c0941038936f47a50e9248be91830d4bd57c48d))
- **network:** connection message after leaving the tab on the phone ([#614](https://github.com/infra-geo-ouverte/igo2-lib/issues/614)) ([b652565](https://github.com/infra-geo-ouverte/igo2-lib/commit/b652565933e382c39cba8d82f43954c49e079356))
- **ogc-filter, style:** better handling grouped layers ([#581](https://github.com/infra-geo-ouverte/igo2-lib/issues/581)) ([f0c33d5](https://github.com/infra-geo-ouverte/igo2-lib/commit/f0c33d5d871b8e43a6e6fca314ecd726803f4b68))
- **query:** fix Firefox and IE svg change bug ([#610](https://github.com/infra-geo-ouverte/igo2-lib/issues/610)) ([9ab8497](https://github.com/infra-geo-ouverte/igo2-lib/commit/9ab8497abf33b029918520478f3b55173f777b5d))
- **queryFormat:** fix layer's queryFormat htmlgml2 ([#620](https://github.com/infra-geo-ouverte/igo2-lib/issues/620)) ([111f8fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/111f8fc5708c4d0a8e72b4ab9762603c2d5a7cc5))
- **search:** provide projection service for coordinates search source ([229c81a](https://github.com/infra-geo-ouverte/igo2-lib/commit/229c81aa7ccf7d8910458c7291ea8ee16fce15d0))
- **spatial-filter:** fix bug when \_internal is not defined ([b7a6354](https://github.com/infra-geo-ouverte/igo2-lib/commit/b7a63543238ad45722da27f262c3815036faa841))
- **time-filter:** fix UTC time, language and style on selected date ([#621](https://github.com/infra-geo-ouverte/igo2-lib/issues/621)) ([30d5573](https://github.com/infra-geo-ouverte/igo2-lib/commit/30d557332cf53d7f72711cf319af8e05dc9e2676))
- **TimeFilter:** calendar year range, don't reset year range in UI (igo2 [#359](https://github.com/infra-geo-ouverte/igo2-lib/issues/359)) ([#619](https://github.com/infra-geo-ouverte/igo2-lib/issues/619)) ([8091a41](https://github.com/infra-geo-ouverte/igo2-lib/commit/8091a41cc22ff6ece7e8d41db38a0176f1216994))

### Features

- **catalog:** add catalog composite ([#559](https://github.com/infra-geo-ouverte/igo2-lib/issues/559)) ([2d729fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/2d729fcfc62469e69eeae40e133e712a94d33fa1))
- **context-list:** add context list tool (alpha, add context) ([#624](https://github.com/infra-geo-ouverte/igo2-lib/issues/624)) ([d8a1431](https://github.com/infra-geo-ouverte/igo2-lib/commit/d8a143185733f143cad27cd7de66e943d7e4b049))
- **context:** allow user to filter context list ([#588](https://github.com/infra-geo-ouverte/igo2-lib/issues/588)) ([0ed466b](https://github.com/infra-geo-ouverte/igo2-lib/commit/0ed466b08ab53a24ccb312aff809c02d5c00787b))
- **datasource:** retrieve options from api ([#583](https://github.com/infra-geo-ouverte/igo2-lib/issues/583)) ([e943f86](https://github.com/infra-geo-ouverte/igo2-lib/commit/e943f86e52c988671c72c840e7eff0f0054526fc))
- **datasource:** retrieve query format from capabilities ([#582](https://github.com/infra-geo-ouverte/igo2-lib/issues/582)) ([1278cef](https://github.com/infra-geo-ouverte/igo2-lib/commit/1278cef19772558b8f8785f5f4d5d9466bb43d9b))
- **import-export:** ajout de l'aggregation pour gpx ([#623](https://github.com/infra-geo-ouverte/igo2-lib/issues/623)) ([20253a4](https://github.com/infra-geo-ouverte/igo2-lib/commit/20253a4d41aa13b10f7513027e467b07b2c7fc38)), closes [#599](https://github.com/infra-geo-ouverte/igo2-lib/issues/599)
- **import:** import cluster ([#616](https://github.com/infra-geo-ouverte/igo2-lib/issues/616)) ([e5dcbfd](https://github.com/infra-geo-ouverte/igo2-lib/commit/e5dcbfd5d9f5c12823db42213563d5678a24a63d))
- **layers:** Enhanced table of content for layers management ([#625](https://github.com/infra-geo-ouverte/igo2-lib/issues/625)) ([31c75a7](https://github.com/infra-geo-ouverte/igo2-lib/commit/31c75a70bd5e1658cfbc746e77fb811fcb2cb690))
- **ogc-filter:** Provide operator at the field scale ([#608](https://github.com/infra-geo-ouverte/igo2-lib/issues/608)) ([f7911db](https://github.com/infra-geo-ouverte/igo2-lib/commit/f7911dbef4c27cb1d1e1175a9914ae95ef10df8d))
- **QueryService:** Add create geom for mapTag when geom is null on extractData [#617](https://github.com/infra-geo-ouverte/igo2-lib/issues/617) ([#618](https://github.com/infra-geo-ouverte/igo2-lib/issues/618)) ([8c07a9f](https://github.com/infra-geo-ouverte/igo2-lib/commit/8c07a9fb619e30e4846909aa2c0420f627696d96))
- **search results:** manage focus/unfocus and select action on search results (and get feature info) ([#585](https://github.com/infra-geo-ouverte/igo2-lib/issues/585)) ([b23693f](https://github.com/infra-geo-ouverte/igo2-lib/commit/b23693fd4ceddda61a777633790718ed1c10ee36))
- **search-setting:** Add a button to check/uncheck all sources ([#589](https://github.com/infra-geo-ouverte/igo2-lib/issues/589)) ([92bbe07](https://github.com/infra-geo-ouverte/igo2-lib/commit/92bbe07403b320c232acae7ec140e7576d9bbf43))

# [1.2.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.1.0...1.2.0) (2020-02-10)

### Bug Fixes

- **actionbar:** icon is not the right size ([5c2e5dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/5c2e5dceedf1dbb0b92561e008247af7d5377d22))
- **auth:** Fix IE11 authentification interceptor bug ([#569](https://github.com/infra-geo-ouverte/igo2-lib/issues/569)) ([583e908](https://github.com/infra-geo-ouverte/igo2-lib/commit/583e9083cd61e6d65b93a6c8bac5a4f5e037c71a))
- **auth:** fix import order of auth and config ([d404ccc](https://github.com/infra-geo-ouverte/igo2-lib/commit/d404ccc0787ed1ee6e84d456d71d7221399dbd7e))
- **catalog:** add resolution to WMTS catalog ([#574](https://github.com/infra-geo-ouverte/igo2-lib/issues/574)) ([e7d426b](https://github.com/infra-geo-ouverte/igo2-lib/commit/e7d426b46c5d4b0252416acd9fc4910e27f69df9))
- **catalog:** options from api ([66ba65a](https://github.com/infra-geo-ouverte/igo2-lib/commit/66ba65a7cd1f221e7b7821e9f3586c8a15d7f327))
- **catalog:** preview layer ([96bec67](https://github.com/infra-geo-ouverte/igo2-lib/commit/96bec67fb7f6d714b0b222cac3fbed4672fdaf56))
- **context:** fix some problems with context updates ([#536](https://github.com/infra-geo-ouverte/igo2-lib/issues/536)) ([202b07b](https://github.com/infra-geo-ouverte/igo2-lib/commit/202b07b4b1e98137a60666899365301249e0fdb1))
- **context:** globals tools ([7079625](https://github.com/infra-geo-ouverte/igo2-lib/commit/707962512f3fe8fa0263bb26f31dd93b152efc14))
- **context:** only layer with source type ([0ae5342](https://github.com/infra-geo-ouverte/igo2-lib/commit/0ae5342a242b346d2935ff699c549039dc6f7425))
- **contexts:** add permission error message change ([#540](https://github.com/infra-geo-ouverte/igo2-lib/issues/540)) ([4710037](https://github.com/infra-geo-ouverte/igo2-lib/commit/471003732d1bdca6da146aa1cf052a4be3ff0ca6))
- **context:** toolbar is replaced instead of merge ([4a808bf](https://github.com/infra-geo-ouverte/igo2-lib/commit/4a808bf2c8bb7cb76333050bd1de448f14324e91))
- **directions:** hover style on steps ([5caca59](https://github.com/infra-geo-ouverte/igo2-lib/commit/5caca597eb4eb8b78e3af9b5666508e5ce77e27d))
- **export:** bug when cluster datasource ([a36648e](https://github.com/infra-geo-ouverte/igo2-lib/commit/a36648eca6f73bddb3c44c541b472b7b175a6c32))
- **geo:** Duplicated WMS params lowercase vs uppercase ([#519](https://github.com/infra-geo-ouverte/igo2-lib/issues/519)) ([9f85d47](https://github.com/infra-geo-ouverte/igo2-lib/commit/9f85d476599088623190a5e091422a7e01666f7b))
- **icherche:** ajust regex to filter type ([dc30fc2](https://github.com/infra-geo-ouverte/igo2-lib/commit/dc30fc2881738d9e27720b3e0e45d84d629d91d5))
- **icherche:** rename bornes to bornes-sumi ([00b1b6e](https://github.com/infra-geo-ouverte/igo2-lib/commit/00b1b6e7eeaaea2f99eec60c821310524cac98c2))
- **ilayer:** hashtags is now working ([5aa5fbd](https://github.com/infra-geo-ouverte/igo2-lib/commit/5aa5fbd7f3b02fa9d656e9b5b3b656d39275d5a2))
- **layer-legend:** fix firefox loading icon ([dc6e5f1](https://github.com/infra-geo-ouverte/igo2-lib/commit/dc6e5f14d135d0a7d322aec5181472a7150eb77c))
- **legend:** loading icon ([637831d](https://github.com/infra-geo-ouverte/igo2-lib/commit/637831d06c216ba457363925ba3ff5209c7e6f2d))
- **measure:** ft tooltip to pi for french translation ([#572](https://github.com/infra-geo-ouverte/igo2-lib/issues/572)) ([e40495e](https://github.com/infra-geo-ouverte/igo2-lib/commit/e40495e7efd3dc264531a9f8491f178c66d3f833))
- minors fix ([f40c785](https://github.com/infra-geo-ouverte/igo2-lib/commit/f40c785a8e34f57dc70eff2be5207d4aae6ee6d2))
- **query:** add warning message for multipolygons in mapserver GML2 ([881270c](https://github.com/infra-geo-ouverte/igo2-lib/commit/881270c91247ef1acbb393019b3c46afc09b55a0))
- **reverseSearch:** fix coordinates and feature selection with reverse search ([#553](https://github.com/infra-geo-ouverte/igo2-lib/issues/553)) ([85c931b](https://github.com/infra-geo-ouverte/igo2-lib/commit/85c931bf7e8b95b0334c443e6d9e16c9aa8374f6))
- scroll / swipe malfunction in mobile ([2d18eb2](https://github.com/infra-geo-ouverte/igo2-lib/commit/2d18eb2b1f5d070f4df684cad59bf29b4f532d73))
- **search-results:** display more results fix ([ce5c6f9](https://github.com/infra-geo-ouverte/igo2-lib/commit/ce5c6f9bc039b73215aaedd1dda8fb0abdc977be))
- **search-results:** features-details stays with tool deactivation ([#555](https://github.com/infra-geo-ouverte/igo2-lib/issues/555)) ([97c81b5](https://github.com/infra-geo-ouverte/igo2-lib/commit/97c81b53f52c52d5585c85618f11bed911f26a66))
- **search-source:** can now define limit and others options in config ([f8ef468](https://github.com/infra-geo-ouverte/igo2-lib/commit/f8ef468c311d4dfd40cfda825b2080ee8ed6beea))
- **search-source:** Replace toFixed by a rounding function to fix error on string data and preventing trailling zeros ([#520](https://github.com/infra-geo-ouverte/igo2-lib/issues/520)) ([9ed03dd](https://github.com/infra-geo-ouverte/igo2-lib/commit/9ed03dd6c4af4a71b499b2f14a1e819385f99146))
- **search:** Fix cadastre and pointer summary setting ([#550](https://github.com/infra-geo-ouverte/igo2-lib/issues/550)) ([15612e4](https://github.com/infra-geo-ouverte/igo2-lib/commit/15612e42cee6f43f098286cc14890d4fdd78fc99))
- **search:** fix some issues with coordinates regex and add options to invert the coordinates if they are not in North America ([f5c959d](https://github.com/infra-geo-ouverte/igo2-lib/commit/f5c959d30b5f91ad7f1164e47e058207a058df41))
- **share-map:** remove included excluded elements when use an api ([d55f9aa](https://github.com/infra-geo-ouverte/igo2-lib/commit/d55f9aafef02e9f9a932be9f99d8aa468e47a990))
- **spatialFilter:** missing traduction fix / CSS title update ([#554](https://github.com/infra-geo-ouverte/igo2-lib/issues/554)) ([04e1beb](https://github.com/infra-geo-ouverte/igo2-lib/commit/04e1beb35cfcd67a5db7c95d099c1d61f1e69f6f))
- **terrapi:** fix if all types is disabled ([28f5c51](https://github.com/infra-geo-ouverte/igo2-lib/commit/28f5c51628ae8b8bc9b579e5ebb6d861b2a186fd))
- **toast-panel:** get feature info collapsible fix ([1a65a92](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a65a92f9453d4f8c1aefc6103d2ccff5e865ece))
- **view:** keepCurrentView option prevent the map to load on init [#477](https://github.com/infra-geo-ouverte/igo2-lib/issues/477) ([2de6393](https://github.com/infra-geo-ouverte/igo2-lib/commit/2de63937bf083279d0be882579701794977d59a4))
- **view:** Zoom to behavior on feature select/zoomto ([#551](https://github.com/infra-geo-ouverte/igo2-lib/issues/551)) ([9e9ed1e](https://github.com/infra-geo-ouverte/igo2-lib/commit/9e9ed1e8399ebb776bd4c0cdc0a2b8aa92e3f2fc))

### Features

- accentuate / emphasize on catalog group title and search results title ([#542](https://github.com/infra-geo-ouverte/igo2-lib/issues/542)) ([c48eb10](https://github.com/infra-geo-ouverte/igo2-lib/commit/c48eb10aa8aa75fc8cc8b0e5fbbac7bb6f3640fc))
- **analytics:** track events ([#557](https://github.com/infra-geo-ouverte/igo2-lib/issues/557)) ([13b4de9](https://github.com/infra-geo-ouverte/igo2-lib/commit/13b4de9616fd59d5c935b4eddbd9982aeedfa0f5))
- **auth:** refresh token ([fa94a3f](https://github.com/infra-geo-ouverte/igo2-lib/commit/fa94a3f8a71a36d42300cf25941120ebc84471ce))
- **baselayer:** the map zoom is now limited by the baselayer ([08c42d2](https://github.com/infra-geo-ouverte/igo2-lib/commit/08c42d29743588d1a0bb64dc83a1bf67414bd803))
- bust cache when user changed ([#543](https://github.com/infra-geo-ouverte/igo2-lib/issues/543)) ([dad02d3](https://github.com/infra-geo-ouverte/igo2-lib/commit/dad02d38977f47811a8e2d0c761baf9c78953720))
- **directions:** improve the directions tool ([#578](https://github.com/infra-geo-ouverte/igo2-lib/issues/578)) ([1ee3f63](https://github.com/infra-geo-ouverte/igo2-lib/commit/1ee3f63ada1136ff53c5ac973b71e0199d175ae6))
- **feature:** possibility to generate mvt data source as regular features or as renderFeatures. ([#527](https://github.com/infra-geo-ouverte/igo2-lib/issues/527)) ([a157337](https://github.com/infra-geo-ouverte/igo2-lib/commit/a157337bee56c35c54e6ae45c1d60f199cd8c8fa))
- **icherche:** can restrict by extent ([ff828a0](https://github.com/infra-geo-ouverte/igo2-lib/commit/ff828a0e62e93ef8d8cc2d866fba87ea867d3efd))
- **ilayer:** add type setting ([f78edaf](https://github.com/infra-geo-ouverte/igo2-lib/commit/f78edaf4077fc59640c082f0ff7e49d54c0f3ce5))
- **import-export:** imported file can be styled from a style list ([#571](https://github.com/infra-geo-ouverte/igo2-lib/issues/571)) ([8b7565c](https://github.com/infra-geo-ouverte/igo2-lib/commit/8b7565ccff1feb86ddd2ae6d923a0ac66a33b2e3))
- **map-details-tool:** empty map message ([#560](https://github.com/infra-geo-ouverte/igo2-lib/issues/560)) ([53cc7ec](https://github.com/infra-geo-ouverte/igo2-lib/commit/53cc7ec9b8d7a2c11a1de9a52d89d6093f997110))
- **map:** new button to manually activate/deactivate offline mode ([#539](https://github.com/infra-geo-ouverte/igo2-lib/issues/539)) ([0e009b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/0e009b160216a03d703bac93d36a72326a0300c9))
- **reverse-search:** Retrieve the mouse coord on move/click ([#537](https://github.com/infra-geo-ouverte/igo2-lib/issues/537)) ([6ea9127](https://github.com/infra-geo-ouverte/igo2-lib/commit/6ea91274d36d46b1be52fe7db7b08c89597146be))
- **reverse-search:** sort by distance ([85468b9](https://github.com/infra-geo-ouverte/igo2-lib/commit/85468b9104654a032c6a25b1dd3136237f691f77))
- **search-results:** Display more results ([#544](https://github.com/infra-geo-ouverte/igo2-lib/issues/544)) ([fce0b94](https://github.com/infra-geo-ouverte/igo2-lib/commit/fce0b9498e2deabf0263b1fe01ea59114471d1f8))
- **search-source:** New search by 'cadastre' number ([#546](https://github.com/infra-geo-ouverte/igo2-lib/issues/546)) ([8b7ca22](https://github.com/infra-geo-ouverte/igo2-lib/commit/8b7ca222a24d994079ab0433465ba563bab9feda))
- **Spatial filter:** add spatial filter tool ([#513](https://github.com/infra-geo-ouverte/igo2-lib/issues/513)) ([de1db79](https://github.com/infra-geo-ouverte/igo2-lib/commit/de1db79dacd70c3bc3296c1c7cb226a7681c07a0))
- **spatial-fiter:** add config ([dfe58b8](https://github.com/infra-geo-ouverte/igo2-lib/commit/dfe58b83491423e6d55988dc7ba67af3db81effc))
- **tooltip:** better tooltip on search results ([2159180](https://github.com/infra-geo-ouverte/igo2-lib/commit/2159180c389df68affb730c7c7327117fb455b8e))
- **view:** add maxZoomOnExtent options to restrict the zoom level after a set extent ([74fae5a](https://github.com/infra-geo-ouverte/igo2-lib/commit/74fae5a86642a17ad78443de7cb5be8cb1aed8dc))
- **view:** animation and padding ([7dc0a0c](https://github.com/infra-geo-ouverte/igo2-lib/commit/7dc0a0c7493d2ac1678fc7a8b8ab29b3b6cf5395))
- **zoom-button:** disable the buttons when the zoom limit is reached ([ea01bdb](https://github.com/infra-geo-ouverte/igo2-lib/commit/ea01bdb4588e3751cb318d1bf07ae99819d393fb))
- **zoom:** Zoom feature ([#524](https://github.com/infra-geo-ouverte/igo2-lib/issues/524)) ([7c76fef](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c76fefee341ec8a9fabb9447a5262da5798f7f9)), closes [#2](https://github.com/infra-geo-ouverte/igo2-lib/issues/2)

# [1.1.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0...1.1.0) (2019-11-12)

### Bug Fixes

- **catalog/map-tool:** Display catalog layer and map layer in the same order ([#424](https://github.com/infra-geo-ouverte/igo2-lib/issues/424)) ([47dc732](https://github.com/infra-geo-ouverte/igo2-lib/commit/47dc732f359c3bbe9df1472dda478ca3fd305115))
- **catalog:** Keep catalog's sort for added layers ([#448](https://github.com/infra-geo-ouverte/igo2-lib/issues/448)) ([eee16b8](https://github.com/infra-geo-ouverte/igo2-lib/commit/eee16b8f655a35f6c394ac9be04990bfdc85a980))
- **context:** a layer that is badly configured or doesn't respond is not added to the map ([fc138d7](https://github.com/infra-geo-ouverte/igo2-lib/commit/fc138d72101a6b56af7444aea808e4de26f9aaa8))
- **context:** remove double default context ([40d4826](https://github.com/infra-geo-ouverte/igo2-lib/commit/40d48260f9390d0848b08a46bc5531ddf523347b))
- **demo:** fix demo for github pages ([f3b6235](https://github.com/infra-geo-ouverte/igo2-lib/commit/f3b6235e44314e38400823879f37ce9a2f165538))
- **filter:** collapse not available on the push button when the layer is not inResolutionRange ([#449](https://github.com/infra-geo-ouverte/igo2-lib/issues/449)) ([58b89c2](https://github.com/infra-geo-ouverte/igo2-lib/commit/58b89c223a49ad6483e9152913ecef95c3fc186e))
- **font-color:** font-color now respect theme ([dedc3b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/dedc3b1b18496582abf497af5c32b870a77ce82d))
- **geometry:** fix geometry form field drawGuide and geometryType model ([b95789d](https://github.com/infra-geo-ouverte/igo2-lib/commit/b95789df40af4c3f8d14b3870565ae97e2bf3037))
- **geometry:** properly destroy geometry input ([#469](https://github.com/infra-geo-ouverte/igo2-lib/issues/469)) ([96afac9](https://github.com/infra-geo-ouverte/igo2-lib/commit/96afac913d9dc6224fbaa6632a627d56c9038665))
- **icherche:** allowed types lieux ([a841bce](https://github.com/infra-geo-ouverte/igo2-lib/commit/a841bced1ccc305b001d6db84f913c4c2ba27bf7))
- **icherche:** distance options ([5fb8a3b](https://github.com/infra-geo-ouverte/igo2-lib/commit/5fb8a3b0ee826ad32c156dceef7e2391022c75a9))
- **icherche:** ignore allowed types if settings is empty ([cb2ac9e](https://github.com/infra-geo-ouverte/igo2-lib/commit/cb2ac9eaaa2702ad9a748dc476519c78467f298a))
- **icherche:** route is avaibled ([1da1cb0](https://github.com/infra-geo-ouverte/igo2-lib/commit/1da1cb020712022d52d08764b9b894bc5ac01bd5))
- **ilayer:** fix undefined title ([adeb8b2](https://github.com/infra-geo-ouverte/igo2-lib/commit/adeb8b2e54b36ba27e1d831437ed23373a424e50))
- **ilayers:** add minScale and maxScale params ([9a47575](https://github.com/infra-geo-ouverte/igo2-lib/commit/9a47575379fdec6fa8d0e4756a0b49964c28a952))
- **layer-list:** layer-list toolbar button were not linked to the layers status ([#467](https://github.com/infra-geo-ouverte/igo2-lib/issues/467)) ([d70eb0f](https://github.com/infra-geo-ouverte/igo2-lib/commit/d70eb0fbc5b098f082517bc694a21a114110fcfb))
- **legend:** The select style into the list is now the style used by the map ([#487](https://github.com/infra-geo-ouverte/igo2-lib/issues/487)) ([f64d73a](https://github.com/infra-geo-ouverte/igo2-lib/commit/f64d73ade3bfdaa6541d6daa8b26032dd2aa2271))
- **lint:** lint and fix excludeAttribute undefined ([0acacd2](https://github.com/infra-geo-ouverte/igo2-lib/commit/0acacd2d0dfd127242bed06cf216471d53c5abb7))
- **map:** geolocate buffer follow the geolocation while it's tracking ([#495](https://github.com/infra-geo-ouverte/igo2-lib/issues/495)) ([a2334fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/a2334fc11c72df51d02d35aef7eb5663029e592c))
- **mapOffline:** set conditions correctly ([#457](https://github.com/infra-geo-ouverte/igo2-lib/issues/457)) ([7105c93](https://github.com/infra-geo-ouverte/igo2-lib/commit/7105c93eb4abeafa6ef61d5369f623e1de18dfce))
- **modify:** allow concave holes ([f212ddd](https://github.com/infra-geo-ouverte/igo2-lib/commit/f212dddbaf83ae75069876295d272966504b07a3))
- **modify:** when drawing a hole and CTRL is released, finish drawing like the user double-clicked ([#437](https://github.com/infra-geo-ouverte/igo2-lib/issues/437)) ([c3535ec](https://github.com/infra-geo-ouverte/igo2-lib/commit/c3535ecea3362507444b24ce7b7395c588abe2b1))
- **naturalCompare:** null values are properly sorted ([eaa7565](https://github.com/infra-geo-ouverte/igo2-lib/commit/eaa7565fd0cfbc66eefcae6906489cb30ad11e50))
- **network:** fix minors bugs ([26f8237](https://github.com/infra-geo-ouverte/igo2-lib/commit/26f8237bc8f5de534b818dee1634b8c86f852b7e))
- **ogc-filter:** display ogc-filter-button ([#446](https://github.com/infra-geo-ouverte/igo2-lib/issues/446)) ([56e45cd](https://github.com/infra-geo-ouverte/igo2-lib/commit/56e45cdb030d39d1637ddfaf81f07e65345dcd89))
- **overlay:** fix addOlFeature typo ([a83d091](https://github.com/infra-geo-ouverte/igo2-lib/commit/a83d091a89ccb14dcee91041c920495347f5cf65))
- **query:** query demo fix (issue [#499](https://github.com/infra-geo-ouverte/igo2-lib/issues/499)) ([#502](https://github.com/infra-geo-ouverte/igo2-lib/issues/502)) ([989ef33](https://github.com/infra-geo-ouverte/igo2-lib/commit/989ef338445f61ae50e301614257cafcb4e9a6f9))
- **search-results-details:** fix flexible state ([af5058d](https://github.com/infra-geo-ouverte/igo2-lib/commit/af5058d0f175422d100782d3ddd55130ae2260e3))
- **search-results-tool:** fix feature missing ([83e0cb4](https://github.com/infra-geo-ouverte/igo2-lib/commit/83e0cb4ff6fdf322102f758717127f688dee73f1))
- **sharemap:** Context was not provided to every links. Impact on layers visibility Issue [#322](https://github.com/infra-geo-ouverte/igo2-lib/issues/322) ([#463](https://github.com/infra-geo-ouverte/igo2-lib/issues/463)) ([47e8454](https://github.com/infra-geo-ouverte/igo2-lib/commit/47e84541aad1e39cc8456d7a35c7c1e4b9b5dc39))
- **shareMap:** remove double buttons ([f78a3b2](https://github.com/infra-geo-ouverte/igo2-lib/commit/f78a3b26a4173994f991e8ae26ef0d65aff8117d))
- **shareMap:** remove options (hasShareMapButton, hasCopyLinkButton) ([be882e2](https://github.com/infra-geo-ouverte/igo2-lib/commit/be882e2d9553b4f95d28c0e4d7d53176b8e3fba8))
- **tool:** fix error caused by tools not having a parent ([67852c3](https://github.com/infra-geo-ouverte/igo2-lib/commit/67852c39aa31509451aef6ba53d668efc813d746))
- **user-button:** show buttons only if api ([adad9b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/adad9b1ed568aa676a89ae29f859f87da61dea3c))
- **wms, token:** add new token to wms layers when changed ([ed37674](https://github.com/infra-geo-ouverte/igo2-lib/commit/ed37674ff230a81b5949c9639af2afffc249e0d9))

### Features

- **action:** add a way to reactively set an actionbar item's availab… ([#425](https://github.com/infra-geo-ouverte/igo2-lib/issues/425)) ([d1eb9cd](https://github.com/infra-geo-ouverte/igo2-lib/commit/d1eb9cd4354ac0b94137cfd085f16daf82d4927a))
- **auth:** show message if password is expired ([2f8f274](https://github.com/infra-geo-ouverte/igo2-lib/commit/2f8f274146b0fff4cc82d09f598bff838c6caaab))
- **catalog:** Layer visibility indicator if out of scale + mouseover ([#512](https://github.com/infra-geo-ouverte/igo2-lib/issues/512)) ([0758c2e](https://github.com/infra-geo-ouverte/igo2-lib/commit/0758c2e3b76bd6fd15ae7131ef153e9b222acd8d))
- **directions:** improve the directions tool ([#452](https://github.com/infra-geo-ouverte/igo2-lib/issues/452)) ([2973ec5](https://github.com/infra-geo-ouverte/igo2-lib/commit/2973ec561747fdabf4b96f135f920a3441340daf))
- **dynamic component:** improve dynamic component input changes detection ([#427](https://github.com/infra-geo-ouverte/igo2-lib/issues/427)) ([f65d46c](https://github.com/infra-geo-ouverte/igo2-lib/commit/f65d46c18c2eddf1011eacf24220c3fec6642349))
- **entity selector:** entity selector may now be disabled ([f7a4a18](https://github.com/infra-geo-ouverte/igo2-lib/commit/f7a4a187c8925034201aeae2898746bd4e57d63d))
- **entity table:** connect entity tables to the state view ([#497](https://github.com/infra-geo-ouverte/igo2-lib/issues/497)) ([1d8252b](https://github.com/infra-geo-ouverte/igo2-lib/commit/1d8252b72b3c61fc0653af2aeb86577c0fcd52ba))
- **feature form:** add a way to retrieve a feature form's data without submitting it ([9527600](https://github.com/infra-geo-ouverte/igo2-lib/commit/952760057168103e2cdb2d0125d5e63fda83b872))
- **filter:** Unify filter access ([#496](https://github.com/infra-geo-ouverte/igo2-lib/issues/496)) ([e52ee8e](https://github.com/infra-geo-ouverte/igo2-lib/commit/e52ee8ec3e85e396ab2aa56b2e90556867483092))
- **font:** add topography config ([2cef056](https://github.com/infra-geo-ouverte/igo2-lib/commit/2cef0563ddff339b9ab5871afacbb2f4d1191e6a))
- **geo.layer.vector:** use sourcefield's alias on query ([#459](https://github.com/infra-geo-ouverte/igo2-lib/issues/459)) ([824ba25](https://github.com/infra-geo-ouverte/igo2-lib/commit/824ba25c0c0c57de5a9899c0b8ae8ddce796970b))
- **geolocation:** possibility to add a buffer to the geolocation ([#394](https://github.com/infra-geo-ouverte/igo2-lib/issues/394)) ([658f3d6](https://github.com/infra-geo-ouverte/igo2-lib/commit/658f3d6e5b3eab31a15e0a610cf707b4ff4f5fe6))
- **geometry:** when drawing or modifying a geometry, pressing space centers the map on the mouse position ([1c176af](https://github.com/infra-geo-ouverte/igo2-lib/commit/1c176af5a6fffcd5fa4a5cb414f5f316bed31f15))
- **i18n:** merge lib and app translations and fix search-selector translation key ([#498](https://github.com/infra-geo-ouverte/igo2-lib/issues/498)) ([175e637](https://github.com/infra-geo-ouverte/igo2-lib/commit/175e637525d2859e9ac0ce8129eab8722d576399))
- **icherche:** add "anciennes-adresses" ([311fb6d](https://github.com/infra-geo-ouverte/igo2-lib/commit/311fb6df0a7f200ce32302860a6d88f3b953e662))
- **icherche:** add icons to search results ([04c50f5](https://github.com/infra-geo-ouverte/igo2-lib/commit/04c50f5ec63913fcf292d596f89264b58f0644c5))
- **icherche:** add radius setting and pass hashtags to service for places ([94d31db](https://github.com/infra-geo-ouverte/igo2-lib/commit/94d31db9d170ff54bdfa7a844ff8f9445f37984b))
- **ilayer:** add subtitle ([11d18c2](https://github.com/infra-geo-ouverte/igo2-lib/commit/11d18c2d4da104b4f209b22977cbdbe637fde29b))
- **import-export:** EPSG not mandatory and fix encoding issue ([#428](https://github.com/infra-geo-ouverte/igo2-lib/issues/428)) ([ee37eb3](https://github.com/infra-geo-ouverte/igo2-lib/commit/ee37eb3f12490f706771cf823ae98788a7601b5d))
- **layer-item:** layer's resolution change depending of the network state ([#395](https://github.com/infra-geo-ouverte/igo2-lib/issues/395)) ([9092530](https://github.com/infra-geo-ouverte/igo2-lib/commit/90925307c4f83744d9e7cb448b8e46d39d3a7502))
- **map:** normalize the dpi to 96 ([#468](https://github.com/infra-geo-ouverte/igo2-lib/issues/468)) ([6f86377](https://github.com/infra-geo-ouverte/igo2-lib/commit/6f863771a1fff7c138a5104236ebe998beea257b))
- **matomo:** it's now possible to define the file names ([a85281c](https://github.com/infra-geo-ouverte/igo2-lib/commit/a85281cec4e1270f13454b2cc5a8b3d404f46216))
- **message-context:** add message in context config ([52337f2](https://github.com/infra-geo-ouverte/igo2-lib/commit/52337f21addbabce0c603eca635d1cb8616b6165))
- **naturalCompare:** treat undefined as nulls ([a1fc5de](https://github.com/infra-geo-ouverte/igo2-lib/commit/a1fc5dec295f8d65ad4558c28196c3b3f20e87a1))
- **network:** new ionic network service ([#490](https://github.com/infra-geo-ouverte/igo2-lib/issues/490)) ([a8222d1](https://github.com/infra-geo-ouverte/igo2-lib/commit/a8222d1650a0e76043d8747612a5223e10050536))
- **network:** now works with cordova ([#393](https://github.com/infra-geo-ouverte/igo2-lib/issues/393)) ([30d07dd](https://github.com/infra-geo-ouverte/igo2-lib/commit/30d07dd0538b7a72370fa68182e2c8b120c5d652))
- **projection:** add mtm projection ([d84be88](https://github.com/infra-geo-ouverte/igo2-lib/commit/d84be88a91f25c337234f5a60f336a1785569080))
- **query, feature:** possibility to exclude attributes ([#465](https://github.com/infra-geo-ouverte/igo2-lib/issues/465)) ([3ecd11e](https://github.com/infra-geo-ouverte/igo2-lib/commit/3ecd11e8184b95af5f9cba01b904ba0dbab7a7f6))
- **strategy:** move strategies from feature to entity store and add filter selection strategy ([#500](https://github.com/infra-geo-ouverte/igo2-lib/issues/500)) ([2a83591](https://github.com/infra-geo-ouverte/igo2-lib/commit/2a8359116b8801b5da517c649b1125d3ed6eaff7))
- **territoire:** add icon and subtitle ([b36b833](https://github.com/infra-geo-ouverte/igo2-lib/commit/b36b833d864a658760be7466932319a44a2b36f9))
- **time-filter:** rename timeAnalysis to timeFilter ([4c7ceaf](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c7ceaf777dded1e089d35461ec51d5ba19e94c1))
- **toolbox:** remove toolbox tooltips when the action titles are displayed ([166618d](https://github.com/infra-geo-ouverte/igo2-lib/commit/166618dcbadf3df4a330c972e236ef380c9b8b0c))
- **toolbox:** the color of the toolbox can be chosen ([5ad989f](https://github.com/infra-geo-ouverte/igo2-lib/commit/5ad989faf8d139894b1f8850444f1d9c1b183f68))
- **track feature:** add possibility to track a feature ([#422](https://github.com/infra-geo-ouverte/igo2-lib/issues/422)) ([6af0c94](https://github.com/infra-geo-ouverte/igo2-lib/commit/6af0c942cada625c763e0a769dc893f369008d7b))
- **transaction:** transaction now a an empty observable and it's possible to retrieve operations ([1199b96](https://github.com/infra-geo-ouverte/igo2-lib/commit/1199b969a70452a32df25d785293c07a895c4ebd))
- **translate:** return key if missing translation and beginning by igo. ([81ac778](https://github.com/infra-geo-ouverte/igo2-lib/commit/81ac778c76082b1b5623443e9b69e982e6f0931c))
- **version:** add current version in config ([145df09](https://github.com/infra-geo-ouverte/igo2-lib/commit/145df09d9ac03371f491bc8796c417ed580d3cc0))

### Reverts

- Revert "ui(query): query results don't have a marker icon anymore" ([9a39582](https://github.com/infra-geo-ouverte/igo2-lib/commit/9a39582b83875187bfdfa961ccf85381ec77e9be))

# [1.0.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.6...1.0.0) (2019-09-23)

### Bug Fixes

- **auth:** error caught ([6d89e07](https://github.com/infra-geo-ouverte/igo2-lib/commit/6d89e0723fef65e9b7104c0277259530a3e8e2f8))
- **catalog-browser:** fixed add/remove function for baselayers catalog ([241d111](https://github.com/infra-geo-ouverte/igo2-lib/commit/241d111a568ea0780d4ceaa121542181ba2c9f2b))
- **catalog:** bug when catalog is empty ([3ef2964](https://github.com/infra-geo-ouverte/igo2-lib/commit/3ef2964e1aefe5ef068aad988054d512e7365e20))
- **catalog:** fix icon ([80b3f51](https://github.com/infra-geo-ouverte/igo2-lib/commit/80b3f51434f11840760aaae4bc0d4c46fb21d8d5))
- **catalog:** wait for all sources ([d13b6f7](https://github.com/infra-geo-ouverte/igo2-lib/commit/d13b6f7deadf8bd7da7d444c69c07de333292bc5))
- **cluster:** makes layer style the base style when a cluster feature as length = 1 ([#398](https://github.com/infra-geo-ouverte/igo2-lib/issues/398)) ([3b1ad3a](https://github.com/infra-geo-ouverte/igo2-lib/commit/3b1ad3a113ac4c7ca8a2113d692f149b19b340c7))
- **directions:** fix directions alpha ([#402](https://github.com/infra-geo-ouverte/igo2-lib/issues/402)) ([33ee728](https://github.com/infra-geo-ouverte/igo2-lib/commit/33ee72849e4e0721e9de48ef4d998e33f04a499c))
- **filter:** set text center on toggle button ([#414](https://github.com/infra-geo-ouverte/igo2-lib/issues/414)) ([bc9f062](https://github.com/infra-geo-ouverte/igo2-lib/commit/bc9f062e0f4230bb5e757b4c75594251797af1a9))
- **geo-layer-id:** id is the same with or whitout origin ([09e2218](https://github.com/infra-geo-ouverte/igo2-lib/commit/09e221840bf9a62846df98aae4672de7f2834b88))
- **icherche:** catch error ([76f9197](https://github.com/infra-geo-ouverte/igo2-lib/commit/76f9197022c7bea1e0b57cfb59993cb3dd437d0c))
- **icherche:** invalid characters ([af1fe8d](https://github.com/infra-geo-ouverte/igo2-lib/commit/af1fe8d5afd8a7ded0a9a296a8ef1d3da9f6888c))
- **import-export:** better error handling ([7952731](https://github.com/infra-geo-ouverte/igo2-lib/commit/79527311236c144f2f003a10a20d973f6223d2c5))
- **import-export:** fix with ogre api ([555bb1e](https://github.com/infra-geo-ouverte/igo2-lib/commit/555bb1e9adef5f54d993ac9c095b4562af118a3f))
- **media:** JS and CSS breakpoint are now the same ([b4262f2](https://github.com/infra-geo-ouverte/igo2-lib/commit/b4262f24569e02ed2645deb22d9f38026b073f20))
- minors bugs, locale ([730df39](https://github.com/infra-geo-ouverte/igo2-lib/commit/730df39913fd9d53ef6c0967198a5dcbb9866803))
- **prod:** fix build prod import ([a2d3a90](https://github.com/infra-geo-ouverte/igo2-lib/commit/a2d3a906db37decff6614bdad3cc8756eeb88e5d))
- **routing:** fix icone, padding, recherche textuelle, label ([#388](https://github.com/infra-geo-ouverte/igo2-lib/issues/388)) ([d7d34e5](https://github.com/infra-geo-ouverte/igo2-lib/commit/d7d34e58706e644c5caf780814db1d2d1a93ee84))
- **search-bar:** use the arrows no longer launching the search ([997ad90](https://github.com/infra-geo-ouverte/igo2-lib/commit/997ad90450d58b78870b492e942b86b5368c54d1))
- **shareMap:** only wms ([8eeb175](https://github.com/infra-geo-ouverte/igo2-lib/commit/8eeb175d879098cc6ef0ba3cb04f9d987c42fa14))
- **wms-wfs:** fix imports format ([9994184](https://github.com/infra-geo-ouverte/igo2-lib/commit/9994184946738815df285ddfa79aa44625ddab9b))

### Features

- **about-tool, ogc-filter-toggle-button:** management of multi-lines ([#399](https://github.com/infra-geo-ouverte/igo2-lib/issues/399)) ([76c63b3](https://github.com/infra-geo-ouverte/igo2-lib/commit/76c63b3c26ac7510862f72ee53718ca881c8b7da))
- **base:** possibility to use a base file to put repetitive elements (tools) ([d8b41d6](https://github.com/infra-geo-ouverte/igo2-lib/commit/d8b41d6a1faef0e608a8276ef4fe0714a9e327ff))
- **catalog:** remove icons ([7b842e3](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b842e31585f9bf409c45dd7a259ed6abe44774d))
- **context:** choose to remove or not all layers on context change ([#406](https://github.com/infra-geo-ouverte/igo2-lib/issues/406)) ([8b2929e](https://github.com/infra-geo-ouverte/igo2-lib/commit/8b2929edf49bb0cacfccdbcd981402675420486e))
- **context:** link context-editor and context-permission ([e153820](https://github.com/infra-geo-ouverte/igo2-lib/commit/e1538200f25d724293062a13a2ce7c5a94065c99))
- **datasource:** Add property to show an attribute on map (label) ([#403](https://github.com/infra-geo-ouverte/igo2-lib/issues/403)) ([860ca13](https://github.com/infra-geo-ouverte/igo2-lib/commit/860ca133688fc03c33a06a1ff0f9c87f7a33f68d))
- **form:** form autocomplete may now be disabled ([b70d404](https://github.com/infra-geo-ouverte/igo2-lib/commit/b70d4042d2d3ee15ce5c3c1878bf417212cf352d))
- **geo.layer.style:** styleByAttribute with regex ([#401](https://github.com/infra-geo-ouverte/igo2-lib/issues/401)) ([6ea3d20](https://github.com/infra-geo-ouverte/igo2-lib/commit/6ea3d20922e94d809febe6b079b281b7fa5a8df9))
- **icherche:** get types allowed ([03cbc64](https://github.com/infra-geo-ouverte/igo2-lib/commit/03cbc64d1ba82c910dc27a2d1be78859504e6986))
- **layer-list:** Show/hide legend on click (title) ([#390](https://github.com/infra-geo-ouverte/igo2-lib/issues/390)) ([37220dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/37220dc023d67e62809ca0a4f405a675addbc332))
- **layer-order:** verify baselayer before move layer ([531d87d](https://github.com/infra-geo-ouverte/igo2-lib/commit/531d87de7796fb5353164c29c8836fc5fd85fe89))
- **legend:** add Legend Switcher on WMS ([#392](https://github.com/infra-geo-ouverte/igo2-lib/issues/392)) ([2a8ca55](https://github.com/infra-geo-ouverte/igo2-lib/commit/2a8ca5544e113c74528c334c565669ec07daff65))
- **search hashtag:** add hashtag to nominatim and ilayer ([a77a2db](https://github.com/infra-geo-ouverte/igo2-lib/commit/a77a2dbc113afa3bdfc64c27679b3c603c752a95))
- **search-details:** search-details is now opened after focus ([e0f4e1c](https://github.com/infra-geo-ouverte/igo2-lib/commit/e0f4e1cab8500324f750d469f0825d8eab4ab47b))
- **search:** add a way to trigger a search (and update the searchbar) manually ([53045c0](https://github.com/infra-geo-ouverte/igo2-lib/commit/53045c0f855a4d95d6f92d1005b42d28c331d511))
- **search:** Add select unselect all button on search setting ([#408](https://github.com/infra-geo-ouverte/igo2-lib/issues/408)) ([4c14a2f](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c14a2f2fc1949a3202a0712beacaeb5ead76221))
- **search:** Apply restrictions programatically to search sources ([#418](https://github.com/infra-geo-ouverte/igo2-lib/issues/418)) ([8787a5f](https://github.com/infra-geo-ouverte/igo2-lib/commit/8787a5fbb8d5989d2be853ef9b7c937a556beb9a))
- **search:** change settings refresh search results ([1978446](https://github.com/infra-geo-ouverte/igo2-lib/commit/1978446137f65b1d7574bb0e054e84958f8f0d8d))
- **search:** decrease latency ([7d87907](https://github.com/infra-geo-ouverte/igo2-lib/commit/7d879072ccfc84d69b3df325303ef17c8659e8dd))
- **shareMap:** Share map alpha for added layers by catalog ([#376](https://github.com/infra-geo-ouverte/igo2-lib/issues/376)) ([18c9572](https://github.com/infra-geo-ouverte/igo2-lib/commit/18c9572609d6495c802e678ead5cf4bbc1e2a7a9))
- **time-filter:** Time filter enhancement alpha ([#411](https://github.com/infra-geo-ouverte/igo2-lib/issues/411)) ([a15e340](https://github.com/infra-geo-ouverte/igo2-lib/commit/a15e340fbe3edca3def1921fec8f01b0bbbfaf3b))
- **toolbox:** add scrool buttons ([#404](https://github.com/infra-geo-ouverte/igo2-lib/issues/404)) ([6e8c62e](https://github.com/infra-geo-ouverte/igo2-lib/commit/6e8c62e4ef34667c2209168c02b6c33d6fee7594))
- **toolbox:** toolbox is now using the theme ([5330977](https://github.com/infra-geo-ouverte/igo2-lib/commit/5330977dfcc1764cc9f6d3f24ccc10a95d032d01))

# [1.0.0-alpha.6](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.5...1.0.0-alpha.6) (2019-08-15)

### Bug Fixes

- **context-list:** dectect change ([ecf80c8](https://github.com/infra-geo-ouverte/igo2-lib/commit/ecf80c83d8fc9ddec8cb46a8d718be073135eed2))
- **layer-list:** id missing ([7c801fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c801fef8927cf81365f3c0fd11819b2181ed214))
- minors bugs ([f79de3d](https://github.com/infra-geo-ouverte/igo2-lib/commit/f79de3d7dd40de9452213842f7fc9940498e0e37))

# [1.0.0-alpha.5](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.4...1.0.0-alpha.5) (2019-08-13)

### Bug Fixes

- **context:** create context with tools ([2624053](https://github.com/infra-geo-ouverte/igo2-lib/commit/26240530135e6c34d2306e41259b34be9e57197b))
- **geo-layer-list:** raise/lower layer ([4fbe5c4](https://github.com/infra-geo-ouverte/igo2-lib/commit/4fbe5c47c1836f2dd62fc766830a4ed5542007e0))
- **geo-translate:** add missing translate ([a9177f7](https://github.com/infra-geo-ouverte/igo2-lib/commit/a9177f7177ff253faf30e254b6dc711a104ca26f))
- **integration-directions:** fix module import ([489a09c](https://github.com/infra-geo-ouverte/igo2-lib/commit/489a09cf191f6ca4f1927082bed8a75c8bc28c2f))
- remove autoscroll list and minors fix ([8455d51](https://github.com/infra-geo-ouverte/igo2-lib/commit/8455d519cb0244064db0bed32c928a1807b4dc73))

### Features

- **geo:search:** add buttons, ajust Metadata, links to Google Maps ([#381](https://github.com/infra-geo-ouverte/igo2-lib/issues/381)) ([60dde1a](https://github.com/infra-geo-ouverte/igo2-lib/commit/60dde1a92e97a3add1f37f736887a55570b78d48))
- **map:** add a directive that change url to path depending on the network status ([#384](https://github.com/infra-geo-ouverte/igo2-lib/issues/384)) ([ad5b5de](https://github.com/infra-geo-ouverte/igo2-lib/commit/ad5b5def5ad423c3508d07fc172ad1ee87c64558))
- **network:** new network service that return the network status ([#380](https://github.com/infra-geo-ouverte/igo2-lib/issues/380)) ([b31254e](https://github.com/infra-geo-ouverte/igo2-lib/commit/b31254e3c533e57df13777246dd538f298ce87b8))

# [1.0.0-alpha.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.3...1.0.0-alpha.4) (2019-08-07)

### Bug Fixes

- **context:** fix minors issues context module ([7771fb9](https://github.com/infra-geo-ouverte/igo2-lib/commit/7771fb92928cf9f6c681ce79952dfbd503ae4fa5))

### Features

- **catalog:** add metadata button ([#377](https://github.com/infra-geo-ouverte/igo2-lib/issues/377)) ([b1083e8](https://github.com/infra-geo-ouverte/igo2-lib/commit/b1083e849ee5f1f82aea1317617500a54a7702df))
- **entity-table:** add option to choose button style ([d0d4aae](https://github.com/infra-geo-ouverte/igo2-lib/commit/d0d4aaee30f5f6a42a8080a039c31bc881468539))
- **ogcFilters:** OgcFilters simplification, PushButtons and fields & operator control ([#361](https://github.com/infra-geo-ouverte/igo2-lib/issues/361)) ([1466996](https://github.com/infra-geo-ouverte/igo2-lib/commit/1466996792bc2a7ba2d3a260ce7c0863431ea6f8))
- **search:** Search setting upgrade ([#375](https://github.com/infra-geo-ouverte/igo2-lib/issues/375)) ([67074c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/67074c690ab1fee9afc30e43518f6c0c0fb5bea2))

# [1.0.0-alpha.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.2...1.0.0-alpha.3) (2019-07-26)

### Bug Fixes

- **catalog:** fix add layer icon ([0a4e591](https://github.com/infra-geo-ouverte/igo2-lib/commit/0a4e5915917c29a79f3cc915feb0618a3df30b3a))
- **context:** fix create layerOptions when create context ([7054b02](https://github.com/infra-geo-ouverte/igo2-lib/commit/7054b025a19a007cd21a99edbddbf4b036e12533))
- **demo:** fix action demo ([bcd2a11](https://github.com/infra-geo-ouverte/igo2-lib/commit/bcd2a1162ccd2bde3876a05539405143b2243a18))
- **entity-table:** fix check for button click functions ([af7b60b](https://github.com/infra-geo-ouverte/igo2-lib/commit/af7b60bedc626216690086a8d9fddab3272db596))
- fix icon, harmonizing crossOrigin syntax and Allow IE 11 to manage some object properly ([#372](https://github.com/infra-geo-ouverte/igo2-lib/issues/372)) ([e9d9f31](https://github.com/infra-geo-ouverte/igo2-lib/commit/e9d9f314753283d73d9b5d24bf74c555baacb2c3))
- **form:** fix disabled form fields ([43d88a2](https://github.com/infra-geo-ouverte/igo2-lib/commit/43d88a26918a1e16ff66ccf069c7d49e504b8ae5))
- **geometry input:** fix buffer of size 0 behavior ([71fac4b](https://github.com/infra-geo-ouverte/igo2-lib/commit/71fac4b772ab03840f016cb76fea45bd0593560a))
- **icons:** fix a few missing icons (post font upgrade) ([308bac4](https://github.com/infra-geo-ouverte/igo2-lib/commit/308bac4bf7807f87d843ae6b8e0a194a35dd27e6))
- **icons:** fix icons ([4d98eb7](https://github.com/infra-geo-ouverte/igo2-lib/commit/4d98eb75c457713d5852296800dfeabfa00765e4))
- **print:** fix print undefined comment ([f537a95](https://github.com/infra-geo-ouverte/igo2-lib/commit/f537a950dd947c1c41bd90318234ef9c781610f2))
- **sharemap:** Limit sharemap url length, Coord precision & skip default context ([#367](https://github.com/infra-geo-ouverte/igo2-lib/issues/367)) ([4c4fb3c](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c4fb3c00bbb3b07d52c3ed20bb3604bc2b6e224))
- **workspace-selector:** change many attr to multi ([4564e91](https://github.com/infra-geo-ouverte/igo2-lib/commit/4564e91a14ef2ac6d50110861492fc7e6ab07a36))
- **zoom:** remove minResolution ([758fb0b](https://github.com/infra-geo-ouverte/igo2-lib/commit/758fb0b9e673ccba490526ad90db65f65a9a61f3))

### Features

- **catalog tool:** allow catalog tool to define the toggle group input ([b5bc01a](https://github.com/infra-geo-ouverte/igo2-lib/commit/b5bc01a46145e188d349b4d8b3038f24bd7dd39c))
- **catalog:** allow ctalogs to define query params and source options ([83d61ce](https://github.com/infra-geo-ouverte/igo2-lib/commit/83d61ce1464b417e9988409d9706c1cdf7a54a77))
- **catalog:** optionnally force a user to expand a group of layers before adding it to the map ([e502a52](https://github.com/infra-geo-ouverte/igo2-lib/commit/e502a52fc39e86a70f2b4c96687c4b24145f030d))
- **datasource,layer:** add MVT datasource, vectortile layer and style by attribute ([#368](https://github.com/infra-geo-ouverte/igo2-lib/issues/368)) ([5ff9239](https://github.com/infra-geo-ouverte/igo2-lib/commit/5ff92399a62794d76bf1088a79b75264f50b0d66))
- **datasource:** add Cluster datasource ([#374](https://github.com/infra-geo-ouverte/igo2-lib/issues/374)) ([d22d3c2](https://github.com/infra-geo-ouverte/igo2-lib/commit/d22d3c29d910955106bef09918d2e277fc3dbe91))
- **entity selector:** support multiple selections ([3d30520](https://github.com/infra-geo-ouverte/igo2-lib/commit/3d305204329f19eb02508949b4ab292341d4ba5f))
- **entity-selector:** support multiple selections ([fc89dd7](https://github.com/infra-geo-ouverte/igo2-lib/commit/fc89dd7062495205c474e4e21bb7ca6b9c735c94))
- **form:** add utility method to retrieve a form's fields ([1329282](https://github.com/infra-geo-ouverte/igo2-lib/commit/13292824a0600de888afaa53b435ce82011d416e))
- **form:** dynamic form fields can now have a disable switch, useful for batch editing, for example ([d7d7fb4](https://github.com/infra-geo-ouverte/igo2-lib/commit/d7d7fb4d84b4571544b69ba54f6a1742c5fa1a85))
- **form:** dynamic forms now support textareas ([bf8d081](https://github.com/infra-geo-ouverte/igo2-lib/commit/bf8d0812c3e16860ee946a551361c37bd4bec618))
- **geometry-form-field:** allow to set symbol ([#373](https://github.com/infra-geo-ouverte/igo2-lib/issues/373)) ([87cf1cd](https://github.com/infra-geo-ouverte/igo2-lib/commit/87cf1cdb2dcda8b9f2846590705bd98d6c97d5d0))
- **icherche:** icherche v2 / territoire ([e0e0a0a](https://github.com/infra-geo-ouverte/igo2-lib/commit/e0e0a0ac032817b6ca253ebdf8080e281f45a52d))
- **query:** Force a geometry to html getfeatureinfo ([#363](https://github.com/infra-geo-ouverte/igo2-lib/issues/363)) ([d2e33ae](https://github.com/infra-geo-ouverte/igo2-lib/commit/d2e33ae9f089dd9b3428115ee363abf3caa67cd5))
- **query:** keep wms title ([9575f30](https://github.com/infra-geo-ouverte/igo2-lib/commit/9575f305e9e7e3630d0930c8bd8d0da7e78674fb))
- **rotation-button:** Set option to always show even if no rotation ([#312](https://github.com/infra-geo-ouverte/igo2-lib/issues/312)) ([58dd071](https://github.com/infra-geo-ouverte/igo2-lib/commit/58dd071e8a7ee34f0ba4641380c00feeaa233f2c))
- **search-results-tool:** add feature details in tool ([753cb23](https://github.com/infra-geo-ouverte/igo2-lib/commit/753cb2363e2c98e339595e016e8754a725792ec1))
- **search:** add Searchsource settings ([#370](https://github.com/infra-geo-ouverte/igo2-lib/issues/370)) ([0a01898](https://github.com/infra-geo-ouverte/igo2-lib/commit/0a01898e27c2fa9e4e8f0479e478198a7792957a)), closes [#349](https://github.com/infra-geo-ouverte/igo2-lib/issues/349)
- **search:** rainbow of possibilities for searching coordinate ([#365](https://github.com/infra-geo-ouverte/igo2-lib/issues/365)) ([e8c2147](https://github.com/infra-geo-ouverte/igo2-lib/commit/e8c21474aa3a23a1de85ccc9328272cadd034e7f)), closes [#288](https://github.com/infra-geo-ouverte/igo2-lib/issues/288)
- **search:** Searchsource hashtag ([#371](https://github.com/infra-geo-ouverte/igo2-lib/issues/371)) ([e69276e](https://github.com/infra-geo-ouverte/igo2-lib/commit/e69276eb44ce62cdc155e932a524e3b0ef33d92d)), closes [#349](https://github.com/infra-geo-ouverte/igo2-lib/issues/349)
- **store:** add an empty$ and count$ observables ([f0de496](https://github.com/infra-geo-ouverte/igo2-lib/commit/f0de49626c8bbcbd47d2f0d022b6d4191ced9d0f))
- **view:** add a count and empty observables to entity views ([4a0444c](https://github.com/infra-geo-ouverte/igo2-lib/commit/4a0444c2ed3a76bac2b07e9f8a1b028dabffeb5a))

# [1.0.0-alpha.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.1...1.0.0-alpha.2) (2019-06-07)

### Bug Fixes

- **action:** fix undefined itemClassFunc ([0e30af3](https://github.com/infra-geo-ouverte/igo2-lib/commit/0e30af3649ab5c14643f61d60e679138873987b4))
- **context-favorite:** api was called even if we were not authenticated ([0d23cc2](https://github.com/infra-geo-ouverte/igo2-lib/commit/0d23cc245922b3b69d937d11cd7d0fb962b52949))
- **coordinates.providers:** remove http dependency ([b6964bd](https://github.com/infra-geo-ouverte/igo2-lib/commit/b6964bd558dcaa17583385371d57ffd45773ddab))
- **demo:** minors fix ([c743add](https://github.com/infra-geo-ouverte/igo2-lib/commit/c743addfe11d65ecfa415a56e19373dd8339cc58))
- **map:** map details' legend was, by default, updated on each resolution change ([0ac6765](https://github.com/infra-geo-ouverte/igo2-lib/commit/0ac67657d8b4324d3980929636b19979f36d4846))
- **share-map:** getUrl must not be executed on component initialization if using the context api ([2f3caeb](https://github.com/infra-geo-ouverte/igo2-lib/commit/2f3caeb7c359b83162b39635d22de574ca0728d6))
- **view:** keepCurrentView ([d83f7aa](https://github.com/infra-geo-ouverte/igo2-lib/commit/d83f7aa01b11480b3f48dfe16d9b51aa11245234))
- **websocket:** update onmessage ([187d4dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/187d4dce5512782a6e81a4b5bec15291bdc24678))
- **wms:** fix xy wms < 1.3.0 ([02abb68](https://github.com/infra-geo-ouverte/igo2-lib/commit/02abb68db4c13430b38fd9035b315767bcd7a38f))

### Features

- **actionbar:** add support a item class function ([86e164b](https://github.com/infra-geo-ouverte/igo2-lib/commit/86e164b84c094a453cff8d3d5cbdc31bb7f6e86b))
- Change material icons for material design icons ([#346](https://github.com/infra-geo-ouverte/igo2-lib/issues/346)) ([dc7bb9d](https://github.com/infra-geo-ouverte/igo2-lib/commit/dc7bb9d5d27b074b4b5d28b23a1cbb15f38ad628))
- **context-menu:** add context-meny and reverse geolocate ([#323](https://github.com/infra-geo-ouverte/igo2-lib/issues/323)) ([9d27dc9](https://github.com/infra-geo-ouverte/igo2-lib/commit/9d27dc931c1736b79ed4a4f83a77e8c775099549))
- **draw:** ability to delete the last vertex when drawing by pushing the ESC key ([7876328](https://github.com/infra-geo-ouverte/igo2-lib/commit/78763282acd0b3f9b4b67decf802dbded83a9d64))
- **draw:** last point can be remved by pushing the ESC key ([e24fd82](https://github.com/infra-geo-ouverte/igo2-lib/commit/e24fd822ecc554baec434a221f1179581c9f5648))
- **entity table:** header can now be fixed (default) ([39bb60f](https://github.com/infra-geo-ouverte/igo2-lib/commit/39bb60ffaf59dfbd1df5a82c2cb1f5cec70832c6))
- **form:** form groups can now have a title ([11e078d](https://github.com/infra-geo-ouverte/igo2-lib/commit/11e078db833262eed647f05a84819d0c07b5f9ad))
- **icon:** include mdi.svg in core module ([861a9e1](https://github.com/infra-geo-ouverte/igo2-lib/commit/861a9e1598afa61068119a2fd2246e7ab4af638e))
- **query:** the query directive now allows querying vector features, which incluses imported and ilayer datasources ([581062c](https://github.com/infra-geo-ouverte/igo2-lib/commit/581062cd8b9580bd9f8728f1d964d116d63e7d02))
- **websocket:** Websocket support ([#264](https://github.com/infra-geo-ouverte/igo2-lib/issues/264)) ([56e611d](https://github.com/infra-geo-ouverte/igo2-lib/commit/56e611d8048cd86619ed213f79753c519c2e66e4))

# [1.0.0-alpha.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/1.0.0-alpha.0...1.0.0-alpha.1) (2019-05-21)

### Bug Fixes

- **measure:** fix remaining issues with the measure dialog ([2bfd165](https://github.com/infra-geo-ouverte/igo2-lib/commit/2bfd165b13c76c982e87d9e23b479a27c6be199c))
- **modify:** clear draw source when activating the draw hole control ([4dc8696](https://github.com/infra-geo-ouverte/igo2-lib/commit/4dc86969bcaeb1103cf06e037b7f1cf8d8a3db61))
- **print:** doZipFile wasn't properly set ([5682e5a](https://github.com/infra-geo-ouverte/igo2-lib/commit/5682e5a05445bdf4c5c01a2e3971299143598324))

### Features

- **editor:** allow defining metadata on editors ([cc48de5](https://github.com/infra-geo-ouverte/igo2-lib/commit/cc48de5b87d9d1dc86e3fca59e409539e9917c32))
- **entity-table:** add button renderer ([ffa0611](https://github.com/infra-geo-ouverte/igo2-lib/commit/ffa0611fcb38e16126413a368b502f4e8db5d57c))
- **measure:** improve the measure dialog interface ([403e748](https://github.com/infra-geo-ouverte/igo2-lib/commit/403e748fd091bffd333cae74f9d3cf75056f7096))
- **selection:** allow feature deselection by holding the CTRL key ([01b910b](https://github.com/infra-geo-ouverte/igo2-lib/commit/01b910bb6e7e2547cc231f7ee37f97441122c71c))
- **selection:** drag box selection ([08b3d7c](https://github.com/infra-geo-ouverte/igo2-lib/commit/08b3d7c96512be8b72df6c3610e4084fdc754c3a))
- **state:** allow state reversing ([2ddf6bd](https://github.com/infra-geo-ouverte/igo2-lib/commit/2ddf6bdd62e548c5e87e678e670ce892304d2493))
- **store:** add a clear method to the selection startegy ([79607c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/79607c66050d0f430422eb591274b8738a21f4e7))

# [1.0.0-alpha.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.26.2...1.0.0-alpha.0) (2019-05-08)

### Bug Fixes

- **analytics:** change piwik to matomo ([8d73e28](https://github.com/infra-geo-ouverte/igo2-lib/commit/8d73e28ef278c1d8c1bdb6332e29395648367230))
- **build:** fix build error caused by a bad import in the widget service ([02b52b3](https://github.com/infra-geo-ouverte/igo2-lib/commit/02b52b3308214d8b03e00a88c3e293d03b459c87))
- **build:** fix builds to work with the new tool module from the common package ([e06c58b](https://github.com/infra-geo-ouverte/igo2-lib/commit/e06c58b250f4f83e5855735311d0dbfdfa982f73))
- **catalog:** fix issue with the catalog browser that displayed nothing the second time it was accessed ([3365b23](https://github.com/infra-geo-ouverte/igo2-lib/commit/3365b23e887efa716141deba4c8c67580881812c))
- **catalog:** properly display layers added or removed from the map tool ([c86f387](https://github.com/infra-geo-ouverte/igo2-lib/commit/c86f387cfb2c0d42ef43fe508705963cdb14e554))
- **context:** fix missing context tools ([30c6fe3](https://github.com/infra-geo-ouverte/igo2-lib/commit/30c6fe351323b56e8703f4567bf8c5c7ab23c374))
- **datasource:** fix xyz and feature datasource id genrator ([b74f9aa](https://github.com/infra-geo-ouverte/igo2-lib/commit/b74f9aa4bc0dc9f60d63f70c5ec2a5c680c15b10))
- **editor:** fix wfs/wms editor issue ([543f800](https://github.com/infra-geo-ouverte/igo2-lib/commit/543f80055259aaf2283c2bcc21954b749cb1a38c))
- **editor:** fix wfs/wms editor issue ([aeb1e57](https://github.com/infra-geo-ouverte/igo2-lib/commit/aeb1e57683d95e3da40957261af4e471e54a7606))
- **entity:** fix issue with shared states ([7ae4226](https://github.com/infra-geo-ouverte/igo2-lib/commit/7ae42266ba49a860b7a3d8f0dfc38f89e568210d))
- **entity:** fix transaction key issue and add count getters on store and view ([abe36df](https://github.com/infra-geo-ouverte/igo2-lib/commit/abe36df430bb99dc44326ab28606f9833e2395bf))
- **form:** change the form choices type from Observable to BehaviorSubject ([9308413](https://github.com/infra-geo-ouverte/igo2-lib/commit/93084139ab8c795f1d9cd159cb7797f5c2467dc5))
- **geometry:** issue when changing the geometry type in the geoemtry field ([648dd96](https://github.com/infra-geo-ouverte/igo2-lib/commit/648dd96a0bd0f2713fea00d3638864e1e51c51b3))
- **icherche:** fix an issue with icherche reverse that occured when parsing the bbox ([be43a71](https://github.com/infra-geo-ouverte/igo2-lib/commit/be43a712c09906ff5d0923dc248771575d0864fc))
- **integrations:** replace tools options with inputs ([7e838ef](https://github.com/infra-geo-ouverte/igo2-lib/commit/7e838efe98668606e5150a872fc2cd0ab8da3e63))
- **layer list:** fix issue with reordering and sorting and clean up some code ([#286](https://github.com/infra-geo-ouverte/igo2-lib/issues/286)) ([6f0b78c](https://github.com/infra-geo-ouverte/igo2-lib/commit/6f0b78c6bdf8b7f4b09b1cfb76fe31d0472c2793))
- **layer:** fix layer issue with capabilities options ([4b6ad54](https://github.com/infra-geo-ouverte/igo2-lib/commit/4b6ad544471b308b5cbb34ad43edfb3df515df31))
- **layer:** fix layer-item unsubscribe issue ([3217860](https://github.com/infra-geo-ouverte/igo2-lib/commit/3217860d130d845d96e7c00dffc0133d85f4af71))
- **layer:** fix map layers ordering and removal ([f88e03d](https://github.com/infra-geo-ouverte/igo2-lib/commit/f88e03d73d09b764af563678edca6bd0877553e4))
- **map:** fix map view error not initialized ([32f12bf](https://github.com/infra-geo-ouverte/igo2-lib/commit/32f12bfdf17912e1dcdc7514fee6354123355bab))
- **mapService:** remove mapService ([96c855c](https://github.com/infra-geo-ouverte/igo2-lib/commit/96c855cfa02962278efc84b1ac74d5c48b130a4e))
- **measure:** fix measurer tool title and i18n ([6a53e45](https://github.com/infra-geo-ouverte/igo2-lib/commit/6a53e45dee6e0c9b13c7c3527a2065c1f1dd855b))
- **measure:** properly clear segment measures after measuring an area ([74ee97f](https://github.com/infra-geo-ouverte/igo2-lib/commit/74ee97f5be5774e782272fdb759645734aba1c5c))
- **overlay:** add missing exports to the index file ([719b25c](https://github.com/infra-geo-ouverte/igo2-lib/commit/719b25c70812a6f093325a027694b8c57da762a8))
- **overlay:** display feature's \_mapTitle property ([100c5bd](https://github.com/infra-geo-ouverte/igo2-lib/commit/100c5bd29b2af425f93276c186678fe945d1723c))
- **polyfills:** Allow string normalization on IE ([#263](https://github.com/infra-geo-ouverte/igo2-lib/issues/263)) ([0d1154e](https://github.com/infra-geo-ouverte/igo2-lib/commit/0d1154e858126f8cd17305a00c9885c5b7398aef))
- **print:** fix print issue with wms legends ([87de1d8](https://github.com/infra-geo-ouverte/igo2-lib/commit/87de1d837f2a45dcf144ae89a504ff3409d6bf08))
- **print:** print comment misplaced ([45d2883](https://github.com/infra-geo-ouverte/igo2-lib/commit/45d28834e959f3d59c8ccb91c9b1a9f0965b9277))
- **providers:** providers must be in public_api ([843061e](https://github.com/infra-geo-ouverte/igo2-lib/commit/843061e39d8fc9e643509bb7b7d3d40eb952e9d1))
- **query:** restore query result layer index when more than one features are returned ([4f6d5f0](https://github.com/infra-geo-ouverte/igo2-lib/commit/4f6d5f0f29c4e7da26204b6190ee0e4d5cd0c5e4))
- **query:** wms version support in query service ([df82157](https://github.com/infra-geo-ouverte/igo2-lib/commit/df82157a6f220cdca073132d33d632aea6c576cd))
- **search-bar:** fix css ([76a33c3](https://github.com/infra-geo-ouverte/igo2-lib/commit/76a33c38ab54896c69b8608b0bc3934c1b5727d6))
- **wfs editor:** fix wfs/wms editor recursion issue ([2cbef26](https://github.com/infra-geo-ouverte/igo2-lib/commit/2cbef26d906cab284ca166b777c128624e049ebb))
- **zoom:** limit max zoom resolution ([4f63adf](https://github.com/infra-geo-ouverte/igo2-lib/commit/4f63adfc7092e11757a2d5ddf30f76d3dd4c99d9))

### Features

- **action:** action module and actionbar component ([017d97e](https://github.com/infra-geo-ouverte/igo2-lib/commit/017d97ededfefda0629f019c336d1665d2264e0a))
- **action:** allow action handlers to receive args ([6a3b8cc](https://github.com/infra-geo-ouverte/igo2-lib/commit/6a3b8ccc9636ad8cf76d6ea3997ec182d13cbd66))
- **angular:** upgrade to angular7 ([02cf0ba](https://github.com/infra-geo-ouverte/igo2-lib/commit/02cf0bac5d44e3188ee5932206046a41151484a2))
- **catalog:** support wmts catalogs and ordering by title ([a5041e9](https://github.com/infra-geo-ouverte/igo2-lib/commit/a5041e9d038557d993ef0273fabf1d2a38f22f0d))
- **catalog:** wmts not support regex filters ([9489dbc](https://github.com/infra-geo-ouverte/igo2-lib/commit/9489dbcbd218b3d7b5090d4839df992803a987ec))
- **config:** use a deep merge for merging the run-time and the environment config ([#287](https://github.com/infra-geo-ouverte/igo2-lib/issues/287)) ([459a9e9](https://github.com/infra-geo-ouverte/igo2-lib/commit/459a9e903b8240a5dcaec43027d2fb6582a86a20))
- **demo:** add table demo ([3ef98db](https://github.com/infra-geo-ouverte/igo2-lib/commit/3ef98db8a1085fba3d0a3d41d2e3c5d70a7b5544))
- **dynamic-component:** dynamic component class and dynamic outlet component ([7b4e90c](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b4e90c03f65875f764816daf66f5618a50ceb5e))
- **edition:** consider thta no entity is selected when more than one is selected ([918ce5b](https://github.com/infra-geo-ouverte/igo2-lib/commit/918ce5bd9a69ffdc8647010a8ffcd7a23c4f6749))
- **edition:** wms edition with ogc filters + wfs download widget ([7f216d4](https://github.com/infra-geo-ouverte/igo2-lib/commit/7f216d496605f22aaa69444677a5eb21b7476857))
- **entity table:** add optional selection checkboxes to the entity table ([5cfe6ac](https://github.com/infra-geo-ouverte/igo2-lib/commit/5cfe6ac7c736e2176f99c9c45ba6fd3091d82587))
- **entity table:** allow custom header class ([00affa1](https://github.com/infra-geo-ouverte/igo2-lib/commit/00affa1fb65804bd3d30c768fcde66edc3df5cf7))
- **entity table:** allow multiple selections ([3b4f1d9](https://github.com/infra-geo-ouverte/igo2-lib/commit/3b4f1d957d93442c7d42b420d0283e126e5f4fe9))
- **entity table:** entity table now supports selection checkboxes ([01f549f](https://github.com/infra-geo-ouverte/igo2-lib/commit/01f549f91567103e96b751d04fe9b1df2a3a0e12))
- **entity table:** select only one entity on row click, and a multiple on checkbox toggle ([1d7ac3b](https://github.com/infra-geo-ouverte/igo2-lib/commit/1d7ac3b904ccc7dd1e063b439948e77882991d32))
- **entity table:** support unsanitized html renderer ([3e6e98d](https://github.com/infra-geo-ouverte/igo2-lib/commit/3e6e98d6c0fd24da7b67b67f1c88d09aaae12334))
- **entity:** entity selector component ([d4e5ea0](https://github.com/infra-geo-ouverte/igo2-lib/commit/d4e5ea0b4715d4656e43adcb3d202df6f018a4a2))
- **entity:** merge entity module and add an entity-table demo ([f892dc2](https://github.com/infra-geo-ouverte/igo2-lib/commit/f892dc25da44a40565c53e7377be83b34df55590))
- **entity:** merge entity module and add an entity-table demo ([757e45b](https://github.com/infra-geo-ouverte/igo2-lib/commit/757e45ba62022ef3fca9827c8762519ff027a62e))
- **feature store:** feature store demo ([d7d4809](https://github.com/infra-geo-ouverte/igo2-lib/commit/d7d4809badd09e1fc8d8ecd332b77933d34e02f4))
- **feature:** improve the featuire store loading strategy motion behavior ([a3e3e04](https://github.com/infra-geo-ouverte/igo2-lib/commit/a3e3e04643cd2ae42a8e8e27cd436c34217c2224))
- **form:** add support for form group valdiation ([b575461](https://github.com/infra-geo-ouverte/igo2-lib/commit/b5754616c8e3f815d62fe6864c1c3ee189ff8b60))
- **form:** configurable forms ([abad9ab](https://github.com/infra-geo-ouverte/igo2-lib/commit/abad9ab0d6154fa619bfd78ec7a0af98c86809cf))
- **form:** make the geometry types configurables in the geometry field ([faa4b45](https://github.com/infra-geo-ouverte/igo2-lib/commit/faa4b45c72197a3bcc919769f4fb1a92258943c5))
- **geometry:** add config options to the geometry form field ([a988179](https://github.com/infra-geo-ouverte/igo2-lib/commit/a98817982fd69ba022e9f65c3bc1b0282819b47e))
- **geometry:** geometry module and geometry form field ([9f4d86d](https://github.com/infra-geo-ouverte/igo2-lib/commit/9f4d86dbccb5846d0f83ed2cdebd4e074f6379db))
- **import-export:** import service returns features and both services let the parent component handle errors. Also, use ogre when possible. ([10bb152](https://github.com/infra-geo-ouverte/igo2-lib/commit/10bb1524a95dc18aae256283cb17a78b300eef0c))
- **import/export:** import/export service supports more file and handles export errors ([405582c](https://github.com/infra-geo-ouverte/igo2-lib/commit/405582c063fe5db34e810e4e121a722e727c9eaa))
- **integration:** add edition module ([ac7791b](https://github.com/infra-geo-ouverte/igo2-lib/commit/ac7791ba4336e59b6b1efbd6fd3ef3ac1b20745a))
- **integration:** add map tool in integration ([d688327](https://github.com/infra-geo-ouverte/igo2-lib/commit/d688327d4e2ff58b16f8d5eac2d24377568dc798))
- **layer:** queryable layers can optionnally have a have indicating that they are queryable ([41930f0](https://github.com/infra-geo-ouverte/igo2-lib/commit/41930f0f17f3e4fa6f654480df5306979a07666f))
- **layer:** Visible layers show legend onInit ([9b79373](https://github.com/infra-geo-ouverte/igo2-lib/commit/9b7937337052258cf2995ee06ce5365973c9608c))
- **legend:** make the legend adapt with the scale level ([d4b823f](https://github.com/infra-geo-ouverte/igo2-lib/commit/d4b823faa9b8269e29292335ef5ce5dd7e8af94e))
- **map:** handle context layer in a way that doesn't interfere with … ([#275](https://github.com/infra-geo-ouverte/igo2-lib/issues/275)) ([feeeb2a](https://github.com/infra-geo-ouverte/igo2-lib/commit/feeeb2a8bbcc3d1ac0f682bc9eabe1b502645811))
- **measure:** after an area measure is complete, remove the segment measures ([ce7066b](https://github.com/infra-geo-ouverte/igo2-lib/commit/ce7066b4c2948acdc9833400da62580fcad0be85))
- **measure:** allow measuring while drawing a geometry using the geometry field ([f476587](https://github.com/infra-geo-ouverte/igo2-lib/commit/f476587e8f382bf55fc75a5a4e051085432410f1))
- **measure:** allow selecting multiple measures with checkboxes ([fd4158f](https://github.com/infra-geo-ouverte/igo2-lib/commit/fd4158f519419dd49f0ebaf38129e96cdc192ac5))
- **measure:** remove vertex measures on completion of an area measure ([90dd732](https://github.com/infra-geo-ouverte/igo2-lib/commit/90dd732803c1ad2e8594f418a472d0aa9c5922b9))
- **measure:** working measure module ([4a74094](https://github.com/infra-geo-ouverte/igo2-lib/commit/4a7409491f9bc14b10a9711ce4f33a25cfd0b12d))
- **measure:** working measure module ([e61a2aa](https://github.com/infra-geo-ouverte/igo2-lib/commit/e61a2aaac288df06ecd31c1ce2333df087c6d7b3))
- **modify:** the modify control can now add holes to a polygon by holding the CTRL key ([601a295](https://github.com/infra-geo-ouverte/igo2-lib/commit/601a295fa366fd1a935f426736ba75afd7bfdcae))
- **package:** upgrade openlayers ([863d849](https://github.com/infra-geo-ouverte/igo2-lib/commit/863d849a6e69a943b8e711e79ee1b402d807f02b))
- **projection:** inject the projection service with the map state ([d3a8f32](https://github.com/infra-geo-ouverte/igo2-lib/commit/d3a8f32012a12fb5ef8ef4a75dc805023784c750))
- **projection:** projection service where custom projections can be registered ([8a7bdd6](https://github.com/infra-geo-ouverte/igo2-lib/commit/8a7bdd634730f30093c094925a6f1dc68e4e8efe))
- **search-results:** search-results-tool ([1e64e46](https://github.com/infra-geo-ouverte/igo2-lib/commit/1e64e46cb9bd9168b3203d568ce91b54777b9f38))
- **search:** add search state ([58a6431](https://github.com/infra-geo-ouverte/igo2-lib/commit/58a643183e5009754e28de8ae77fd42c09699a20))
- **search:** allow custom search types ([cd1b282](https://github.com/infra-geo-ouverte/igo2-lib/commit/cd1b282a0f0cc7b810a42952d44225d0973668ab))
- **search:** don't display the number of results per source if there is only one and remove the layer index in a map query result ([9b056a9](https://github.com/infra-geo-ouverte/igo2-lib/commit/9b056a9331c1ffde1f9bfdc2f8ac3bd0f0f4f630))
- **search:** make search source params overridable on demand ([9789f11](https://github.com/infra-geo-ouverte/igo2-lib/commit/9789f11c1269907604ce114b06e912d6c1884b98))
- **slice:** working slice control (polygons only) ([0cdd328](https://github.com/infra-geo-ouverte/igo2-lib/commit/0cdd328b76e14f25ff3298846bb68a96bd009cd1))
- **spinner:** improve spinner behavior ([e360f60](https://github.com/infra-geo-ouverte/igo2-lib/commit/e360f60b414349239f84370772a9e78ae54fb617))
- **store:** make it possible to configure the feature store movement ([932a8bf](https://github.com/infra-geo-ouverte/igo2-lib/commit/932a8bf4232eada3cd9e5c883be58d8b9831d305))
- **toolbox:** refactor context toolbar into a better and reusable toolbox ([64e078d](https://github.com/infra-geo-ouverte/igo2-lib/commit/64e078d211759024ac79668279f58038bbd1099d))
- **transaction:** uncommited transactions can be rollbacked ([d93fe04](https://github.com/infra-geo-ouverte/igo2-lib/commit/d93fe044b8fbc83af69ca403f66b13cca9c9d346))
- **view:** move most of the map view stuff into a dedicated controller and track the previous and next view state ([c8d86c6](https://github.com/infra-geo-ouverte/igo2-lib/commit/c8d86c64ea0daaa90fb0082fb088c82bde6fc46b))
- **wfs:** ogc filter widget title and tooltip ([#282](https://github.com/infra-geo-ouverte/igo2-lib/issues/282)) ([13d2eb1](https://github.com/infra-geo-ouverte/igo2-lib/commit/13d2eb1ebb18433378c5c8993a1d6ded2b90e713))
- **widget:** add widget type ([0ca4281](https://github.com/infra-geo-ouverte/igo2-lib/commit/0ca4281be3db8916b0fb7dffc43b2eb461f32a8d))
- **widget:** allow passing subscribers to a widget ([56665f9](https://github.com/infra-geo-ouverte/igo2-lib/commit/56665f9d7e2198f23bcabc2ed82b82256d58ff0d))
- **widget:** widget module. A widget is a specialez version of a dynamic component ([3da3e34](https://github.com/infra-geo-ouverte/igo2-lib/commit/3da3e3446594977bfe31e328051bbc682c898af6))
- **wms:** Provide title to grouped layers (comma) ([e8ddafa](https://github.com/infra-geo-ouverte/igo2-lib/commit/e8ddafa388b75c742e6df55f34d796cefbf531ab))

## [0.26.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.26.1...0.26.2) (2019-02-15)

### Bug Fixes

- **custom-html:** ByPassTrustHtml to string declared as html ([#256](https://github.com/infra-geo-ouverte/igo2-lib/issues/256)) ([7a9b71d](https://github.com/infra-geo-ouverte/igo2-lib/commit/7a9b71d6b603af9f12385e720280955af11d166c))
- **rotation:** add rotation button ([#261](https://github.com/infra-geo-ouverte/igo2-lib/issues/261)) ([039ae62](https://github.com/infra-geo-ouverte/igo2-lib/commit/039ae625cdb27bee688c020ca0be9a5bfea1a569))
- **string:** inverse inserted and deleted class when string is empty ([e486b4c](https://github.com/infra-geo-ouverte/igo2-lib/commit/e486b4c40b91786f15927e97a89c18f9a9c95989))
- various minor fix ([#262](https://github.com/infra-geo-ouverte/igo2-lib/issues/262)) ([3f3f054](https://github.com/infra-geo-ouverte/igo2-lib/commit/3f3f05426b126a568282bb0cb7e73391079e0327))

## [0.26.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.26.0...0.26.1) (2019-02-08)

### Features

- **theme:** add teal theme ([9cbc2d7](https://github.com/infra-geo-ouverte/igo2-lib/commit/9cbc2d70af4ac6907e348702dbfa081d209b33e7))

# [0.26.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.25.0...0.26.0) (2019-02-07)

### Bug Fixes

- **package:** add angular-cli-ghpages dependencies ([f138029](https://github.com/infra-geo-ouverte/igo2-lib/commit/f13802941ac2fc2c54d17e1550d6da8092255622))

# [0.25.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.24.3...0.25.0) (2019-02-07)

### Bug Fixes

- **gulpfile:** Empty directory ([#252](https://github.com/infra-geo-ouverte/igo2-lib/issues/252)) ([6bf6bd6](https://github.com/infra-geo-ouverte/igo2-lib/commit/6bf6bd62252ddaba8cbfda996050183419736add))
- **layer-list:** wrong keyword was used. ([#253](https://github.com/infra-geo-ouverte/igo2-lib/issues/253)) ([12785d4](https://github.com/infra-geo-ouverte/igo2-lib/commit/12785d41b23c7b9226148c92aa3c498f5456887d))
- **ogc-filter:** OGC Filters from contexts now interpreted ([#257](https://github.com/infra-geo-ouverte/igo2-lib/issues/257)) ([f209332](https://github.com/infra-geo-ouverte/igo2-lib/commit/f2093328dad07b9b161de4d9f41a13da4b1ca36e))
- **string-utils:** cast to string ([e12feb2](https://github.com/infra-geo-ouverte/igo2-lib/commit/e12feb23c72bd08b5be6a53d4ec2e19c5c1eb9de))

### Features

- **cache:** add metadata tag to cache calls ([793d1ff](https://github.com/infra-geo-ouverte/igo2-lib/commit/793d1ff3efdba2c73b74e5c1cc63f65f7cbf1530))
- **gulp:** upgrade gulp to 4.0 ([b051df8](https://github.com/infra-geo-ouverte/igo2-lib/commit/b051df89973d31fa69b50d7ea11ee0a1a5d69e72))
- **layer-list:** Allow search with layer keyword (capabilities or context) ([#250](https://github.com/infra-geo-ouverte/igo2-lib/issues/250)) ([9c7ee86](https://github.com/infra-geo-ouverte/igo2-lib/commit/9c7ee862da84fbc114d03f41b8a97e5bcf7b27d2))
- **layer-list:** control layerlist by url ([#248](https://github.com/infra-geo-ouverte/igo2-lib/issues/248)) ([7e609af](https://github.com/infra-geo-ouverte/igo2-lib/commit/7e609afb4e5f7d42bd0e4ae89f66bcd47373ca0e))
- **package:** update package-lock ([33dec7c](https://github.com/infra-geo-ouverte/igo2-lib/commit/33dec7c7ba623b3579d5ad44a38126866f1f5a08))
- **query:** Provide ALIAS to wms getfeatureinfo(gml), wfs and vector datasources ([#249](https://github.com/infra-geo-ouverte/igo2-lib/issues/249)) ([871be03](https://github.com/infra-geo-ouverte/igo2-lib/commit/871be03058aee322c635d05a5abcd12afb2610e3))
- **sidenav:** put the same title as the tab ([eaece1c](https://github.com/infra-geo-ouverte/igo2-lib/commit/eaece1cad9ac5d473089b7fae4c3426db1449f3d))
- **theme:** add blue theme ([0652936](https://github.com/infra-geo-ouverte/igo2-lib/commit/0652936f008c2e820bef9592480b9bed2ecdb13a))

## [0.24.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.24.2...0.24.3) (2018-12-06)

### Bug Fixes

- **print:** Print options fix Issue [#189](https://github.com/infra-geo-ouverte/igo2-lib/issues/189) ([#238](https://github.com/infra-geo-ouverte/igo2-lib/issues/238)) ([6f8921e](https://github.com/infra-geo-ouverte/igo2-lib/commit/6f8921e9dea4a7958e114ec90eb737f252ae9e05))
- **query:** remove shape propertie after getFeatureInfo ([a79637c](https://github.com/infra-geo-ouverte/igo2-lib/commit/a79637c498905ad5606b33cfcde8535693acd616))

### Features

- **datasource:** add Carto capabilities from mapId, add legends for Carto and ArcGIS Rest ([d908484](https://github.com/infra-geo-ouverte/igo2-lib/commit/d908484b07a86581f29a5d84f5f48ce71c51c99e))
- **demo:** add ArcGIS Rest, Tile ArcGIS Rest and Carto examples ([d095cd6](https://github.com/infra-geo-ouverte/igo2-lib/commit/d095cd6445e25485a00f25dd87fded6573a4ff18))
- **list:** igo-list-items can now be disabled ([#233](https://github.com/infra-geo-ouverte/igo2-lib/issues/233)) ([ebdc466](https://github.com/infra-geo-ouverte/igo2-lib/commit/ebdc466b7b5d6418872c6633db9c63391f3c18a9))
- **panel:** make it possible to create a igo-panel without a header ([dc9783e](https://github.com/infra-geo-ouverte/igo2-lib/commit/dc9783e1577107288fa67dd17fee06fab3f797bb))

## [0.24.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.24.1...0.24.2) (2018-11-02)

### Bug Fixes

- **import:** add mimetype for zip file ([6dc9cce](https://github.com/infra-geo-ouverte/igo2-lib/commit/6dc9cce9ec68657f95124bfddd1f1df430c6a3cf))
- **layer:** options defined in context take precedence over getCapabilities ([e6bc48f](https://github.com/infra-geo-ouverte/igo2-lib/commit/e6bc48fe72ee4d4069b09819a286f0c836afe320))

## [0.24.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.24.0...0.24.1) (2018-11-01)

### Bug Fixes

- **context:** change url context ([c864845](https://github.com/infra-geo-ouverte/igo2-lib/commit/c864845edd614c6923cf3a16802bcc1ed3357234))
- **datasource-search-source:** change default url ([46eaf49](https://github.com/infra-geo-ouverte/igo2-lib/commit/46eaf49cd607269d9a37934c6a4c8b1d125bacf3))
- **directions:** Clear directions and stops on destroy ([#216](https://github.com/infra-geo-ouverte/igo2-lib/issues/216)) ([ce6fa35](https://github.com/infra-geo-ouverte/igo2-lib/commit/ce6fa35fa70af695c21dc019f4c49759bf1a411a))
- **routing:** Disable queryLayers on routing and reactivate on destroy ([#217](https://github.com/infra-geo-ouverte/igo2-lib/issues/217)) ([f7f3989](https://github.com/infra-geo-ouverte/igo2-lib/commit/f7f3989daf984a5a7d204feb2dfb5704006ad356))

### Features

- **query:** queryable is true by default ([d13e6fd](https://github.com/infra-geo-ouverte/igo2-lib/commit/d13e6fded53c305d7b71617c4ccd74f74552d6c1))
- **route:** provide new key to control which tool to open by default ([#222](https://github.com/infra-geo-ouverte/igo2-lib/issues/222)) ([9a2abf9](https://github.com/infra-geo-ouverte/igo2-lib/commit/9a2abf94d033019549020093832e75dce91ce36d))

# [0.24.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.23.1...0.24.0) (2018-10-30)

### Bug Fixes

- **context:** api layer options ([85b5c66](https://github.com/infra-geo-ouverte/igo2-lib/commit/85b5c66d5b06d09026daae13110ea86a4d0f3ed3))
- **context:** fix default context ([a632017](https://github.com/infra-geo-ouverte/igo2-lib/commit/a632017356843b6d21d8f3e8f2890ece48135144))
- **context:** locale do not contains common keys ([b8113c9](https://github.com/infra-geo-ouverte/igo2-lib/commit/b8113c9a1be7fd6ff4dfe987278444ff8b3d2034))
- **context:** locale do not contains common keys ([#192](https://github.com/infra-geo-ouverte/igo2-lib/issues/192)) ([f9f116a](https://github.com/infra-geo-ouverte/igo2-lib/commit/f9f116ab077c1f990c4720b37832138210e89a8e))
- **context:** rename order to zIndex ([3c7f958](https://github.com/infra-geo-ouverte/igo2-lib/commit/3c7f9582a8a8a4618a718d0e6c660afa98c57572))
- **context:** send type layer to api ([81436c8](https://github.com/infra-geo-ouverte/igo2-lib/commit/81436c8b5f8020e53cd24011d2a4f6ad41e969c2))
- **context:** stop propagation on button ([a923548](https://github.com/infra-geo-ouverte/igo2-lib/commit/a92354807baa84c4b24c46117da6370f31d9ce1f))
- **css:** add padding to forms ([3d27dee](https://github.com/infra-geo-ouverte/igo2-lib/commit/3d27dee68486899b4bb496acb2dbc1849ab9ff37))
- **css:** add padding to forms ([5c33716](https://github.com/infra-geo-ouverte/igo2-lib/commit/5c337167377f6930ba415d95d76b078698cd49a7))
- **custom-html:** add padding ([f3bced5](https://github.com/infra-geo-ouverte/igo2-lib/commit/f3bced58dbe593e76d475ba69b01df22e0fcf9e9))
- **datasource:** always lowercase type ([98aee36](https://github.com/infra-geo-ouverte/igo2-lib/commit/98aee365ffcbf0fcb78286e49cf8ff58002e53bf))
- **demo:** ajust size map (responsible) ([84a6794](https://github.com/infra-geo-ouverte/igo2-lib/commit/84a679475e8ff241a13a77665f36692a113dc235))
- **dropGeoFile:** directive not working (build prod - aot) ([402d21c](https://github.com/infra-geo-ouverte/igo2-lib/commit/402d21c5831adda014d6759b1975b1dae38ad635))
- **getCapabilities:** fix options from getCapatibilities ([e6efe73](https://github.com/infra-geo-ouverte/igo2-lib/commit/e6efe73d1e27939cf15e8b26eafe020442bbbcd7))
- **getCapabilities:** merge getCapabilities and json options ([445757c](https://github.com/infra-geo-ouverte/igo2-lib/commit/445757c7300963f86566c9f0840cd61493af98cf))
- **import-export:** add missing imports ([04af7df](https://github.com/infra-geo-ouverte/igo2-lib/commit/04af7df8887e7420dd887a8a077c683abe595864))
- **import-export:** fix drop file on map ([e6f7c58](https://github.com/infra-geo-ouverte/igo2-lib/commit/e6f7c582f8e65ee0febe0e8091344df0e2ff6cb2))
- **layer-list:** fix css of the sorting button and filter on mobile ([497f15e](https://github.com/infra-geo-ouverte/igo2-lib/commit/497f15e56be3253d6d40db02a9ee09ac684895b2))
- **layer-list:** remove empty space above the list - fix issue [#187](https://github.com/infra-geo-ouverte/igo2-lib/issues/187) ([#190](https://github.com/infra-geo-ouverte/igo2-lib/issues/190)) ([34449dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/34449dc9411c67a7ba1cfe5ec917157ced0ef403))
- **layer:** fix optionsFromCapabilities ([4bfb4ce](https://github.com/infra-geo-ouverte/igo2-lib/commit/4bfb4ceec0883937da16693ebd7430929db78ece))
- **map:** offset baselayer in prod build ([f0cb14a](https://github.com/infra-geo-ouverte/igo2-lib/commit/f0cb14afebdb09852b59058963154bae40d3d85b))
- **metadata:** define metadata in layerOptions ([de7baed](https://github.com/infra-geo-ouverte/igo2-lib/commit/de7baed5a4953eae5a5f2658888e83dc9bfca7e0))
- **ogc-filter:** Fix for Angular 6 and adjustements for minilib ([#186](https://github.com/infra-geo-ouverte/igo2-lib/issues/186)) ([cb77a93](https://github.com/infra-geo-ouverte/igo2-lib/commit/cb77a935c1deb4a9f76d696e14d6473789d65dbe))
- **panel:** title is now centred ([d2d41a9](https://github.com/infra-geo-ouverte/igo2-lib/commit/d2d41a92608f8902d9771a81c4ee0163e68838f5))
- **print:** geotiff filename ([d1f3ff7](https://github.com/infra-geo-ouverte/igo2-lib/commit/d1f3ff73166994873b72eb4da524d58a8d02862d))
- **print:** pdf height-width undefined ([8a46749](https://github.com/infra-geo-ouverte/igo2-lib/commit/8a467494dfcb01d768cae464e51a08cdb8a094f0))
- **search-layer:** fix search layer type ([0ea77fa](https://github.com/infra-geo-ouverte/igo2-lib/commit/0ea77fa08ad6f4e837e0ed643e03df39bb7e83be))
- **time-filter:** get options from capabilities ([aa359de](https://github.com/infra-geo-ouverte/igo2-lib/commit/aa359de714eee1b83095cf4f2443470208fab489))
- **time-filter:** take current date if min is not defined ([edee6f2](https://github.com/infra-geo-ouverte/igo2-lib/commit/edee6f20adf6a87be691b34825f947bd2e5b75dd))
- **toolbar:** rename toolbar click event to trigger to avoid overriding the default click event ([#206](https://github.com/infra-geo-ouverte/igo2-lib/issues/206)) ([5a040fa](https://github.com/infra-geo-ouverte/igo2-lib/commit/5a040fab7d348072f802b7881a543d08fa0d0432))
- **WMTS:** GetCapbilities import error ([#205](https://github.com/infra-geo-ouverte/igo2-lib/issues/205)) ([1e13fdb](https://github.com/infra-geo-ouverte/igo2-lib/commit/1e13fdbb3aa6f1bba56cb1e752ceae5ca0cdc993))

### Features

- **backdrop:** let the backdrop be shown on any media instead of on mobiles only ([#202](https://github.com/infra-geo-ouverte/igo2-lib/issues/202)) ([d8cea17](https://github.com/infra-geo-ouverte/igo2-lib/commit/d8cea174edf83e5bec55a45c23c2e01b75b7471b))
- **map-details-tool:** add filter/download/metadata button on layer item ([0d43226](https://github.com/infra-geo-ouverte/igo2-lib/commit/0d43226c331da3f1a711d6581c5996e9961c0690))
- **map:** Prevent zooming on result if already contained in map extent ([#193](https://github.com/infra-geo-ouverte/igo2-lib/issues/193)) ([d917886](https://github.com/infra-geo-ouverte/igo2-lib/commit/d9178864838c61f1cbb16b6e8d77f126feeca066))
- **notifications:** upgrade angular-notifications ([45c626e](https://github.com/infra-geo-ouverte/igo2-lib/commit/45c626e23a54a4c1109e1e92bbb03ff39b934d41))
- **overlay:** Feature zoom if not in extent based on feature geometry. ([#198](https://github.com/infra-geo-ouverte/igo2-lib/issues/198)) ([dd92fc8](https://github.com/infra-geo-ouverte/igo2-lib/commit/dd92fc81aadabb401eb5bce42cd4e335e7f432f1))
- **print:** Add test layers for CORS in print ([#183](https://github.com/infra-geo-ouverte/igo2-lib/issues/183)) ([63dfc9e](https://github.com/infra-geo-ouverte/igo2-lib/commit/63dfc9ef2f7eed2ca1e171df34056993a6bec4e6))
- **print:** Improve Print module ([#179](https://github.com/infra-geo-ouverte/igo2-lib/issues/179)) ([d066e64](https://github.com/infra-geo-ouverte/igo2-lib/commit/d066e64ca8eaaaa7fe62fcc7efc6ed513b730622))
- **search-source:** Provide interface for reseautq ([#199](https://github.com/infra-geo-ouverte/igo2-lib/issues/199)) ([043c168](https://github.com/infra-geo-ouverte/igo2-lib/commit/043c168177481ce6fcf7500522f36e954adbb50f))
- **search-source:** Reseau transport quebec ([#176](https://github.com/infra-geo-ouverte/igo2-lib/issues/176)) ([21086e1](https://github.com/infra-geo-ouverte/igo2-lib/commit/21086e1a96d001db59b70e304bec5584af7d8a84))
- **toolbar:** toolbar emit a click event as well as the usual select event ([#201](https://github.com/infra-geo-ouverte/igo2-lib/issues/201)) ([931175d](https://github.com/infra-geo-ouverte/igo2-lib/commit/931175d9f3e6b2ac18ecb668d552708ef84fea22))
- **wms:** Refresh interval on WMS ([#177](https://github.com/infra-geo-ouverte/igo2-lib/issues/177)) ([f8c40ea](https://github.com/infra-geo-ouverte/igo2-lib/commit/f8c40ead371d52941380fec14d6fab8eda55b8bb))

## [0.23.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.23.0...0.23.1) (2018-09-07)

### Bug Fixes

- **tool:** export directly tool.service ([6e7dd01](https://github.com/infra-geo-ouverte/igo2-lib/commit/6e7dd01e47f1253f1326c07322b8eef60196d5bf))

# [0.23.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.22.2...0.23.0) (2018-09-07)

### Bug Fixes

- **auth:** fix and improve login/logout route ([cf3d1a2](https://github.com/infra-geo-ouverte/igo2-lib/commit/cf3d1a2d35adf7935ee1f2dc2ddb79515e8a943a))
- **auth:** fix login/logout/alreadyLogin div ([55fdc2a](https://github.com/infra-geo-ouverte/igo2-lib/commit/55fdc2aaccee12977fb2bb504ea7bdb4eda1472a))
- **build prod:** fix path destination ([c0de9e1](https://github.com/infra-geo-ouverte/igo2-lib/commit/c0de9e17e64ff737bf121f8614c32cb3bd8eb9cb))
- **change:** rename modif to change ([4e79fb3](https://github.com/infra-geo-ouverte/igo2-lib/commit/4e79fb3e83da484041d0091311be62b2a7b786ec))
- **context directive:** fix No provider for MapBrowserComponent ([329363e](https://github.com/infra-geo-ouverte/igo2-lib/commit/329363e80433ba8acef3776e1707371c44c8a079))
- **directions:** Directions minor fixes ([#175](https://github.com/infra-geo-ouverte/igo2-lib/issues/175)) ([19c4b4c](https://github.com/infra-geo-ouverte/igo2-lib/commit/19c4b4c2d00c5affcbae8dafac37919345c176f5))
- **filter:** fix topo function ([b25d9ed](https://github.com/infra-geo-ouverte/igo2-lib/commit/b25d9ed8d73f87cbefb452b58268b24838a90601))
- **json dialog:** rename component app-json-dialog to igo-json-dialog ([c4cbf29](https://github.com/infra-geo-ouverte/igo2-lib/commit/c4cbf29246d6d4a2b20bc5a9455c4fea488af30f))
- **modif:** immuable object ([6c3ae40](https://github.com/infra-geo-ouverte/igo2-lib/commit/6c3ae400737d193842dfc2251460d27cad4651d2))
- **modif:** inverse added and deleted ([2fb09b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/2fb09b13f0218cbb248e2d24dced77e6b8799fd5))
- **routing:** fix move pin ([388d808](https://github.com/infra-geo-ouverte/igo2-lib/commit/388d808fefdd82c80762d1a9bb1d170ba79ae54a))
- **search-bar:** Adding a pinpoint on locate XY by searchbar ([#167](https://github.com/infra-geo-ouverte/igo2-lib/issues/167)) ([3380ccf](https://github.com/infra-geo-ouverte/igo2-lib/commit/3380ccfbb5d25ade6d26d1176fc3cfaa53c4c4e4))
- **table:** reset selection when database changed ([7b5ef33](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b5ef33252703ea38bc247c8ea6895460bf65d02))

### Features

- **auth:** add guards ([49c6bc9](https://github.com/infra-geo-ouverte/igo2-lib/commit/49c6bc9fb23bd730def6d1aa298f6be103ccddb9))
- **auth:** options allowAnonymous ([945664f](https://github.com/infra-geo-ouverte/igo2-lib/commit/945664f3f33e01fcd43d5cf9d22f20390c1904fb))
- **datasource:** add layer source connection to CARTO and ArcGIS Rest services ([#174](https://github.com/infra-geo-ouverte/igo2-lib/issues/174)) ([3976c45](https://github.com/infra-geo-ouverte/igo2-lib/commit/3976c45348e0583a68f7075db615b3724eff543d))
- **demo:** add context demo ([b3261a1](https://github.com/infra-geo-ouverte/igo2-lib/commit/b3261a13d0759a0741de7b38ba63cf78a8a9dc49))
- **import service:** more flexible and permissibe way to import files ([#162](https://github.com/infra-geo-ouverte/igo2-lib/issues/162)) ([af66dae](https://github.com/infra-geo-ouverte/igo2-lib/commit/af66dae29dcd1093ee72d074fd4baf64093a4f8b))
- **json-dialog:** add json dialog component ([81a7aff](https://github.com/infra-geo-ouverte/igo2-lib/commit/81a7affd2b8d583548e61eb89c9298316dd9247a))
- **modif:** add utils to find difference between arrays ([65cb301](https://github.com/infra-geo-ouverte/igo2-lib/commit/65cb301666361260bb2f3e3a3c0e6ac2200f24c4))
- **object-utils:** add natural sort util ([88e1b74](https://github.com/infra-geo-ouverte/igo2-lib/commit/88e1b74da99ba9d0f5ba83c2f8af7bdaad9715bd))
- **print:** add comment, legend, scale and projection in pdf. New possibility to download image of map. ([#171](https://github.com/infra-geo-ouverte/igo2-lib/issues/171)) ([7d45a9d](https://github.com/infra-geo-ouverte/igo2-lib/commit/7d45a9d8bdcd13b15d4f2642fe95a44122b4d335))
- **routing:** add routing on osrm ([#166](https://github.com/infra-geo-ouverte/igo2-lib/issues/166)) ([664f42a](https://github.com/infra-geo-ouverte/igo2-lib/commit/664f42a5254cb607eec4894fd07fb341dde32929))
- **string-utils:** add utils to find difference between 2 strings ([0685845](https://github.com/infra-geo-ouverte/igo2-lib/commit/0685845e0257c345d63bcbce09936e2f845c8396))
- **table:** improve table component (selection, filter) ([560308b](https://github.com/infra-geo-ouverte/igo2-lib/commit/560308b95e4eb09649938ae638d70c89519a47e9))
- **time-filter:** add time filter in catalog, possibility to have time filter on minute ([#172](https://github.com/infra-geo-ouverte/igo2-lib/issues/172)) ([b74b910](https://github.com/infra-geo-ouverte/igo2-lib/commit/b74b910e45606b594a5190d78991e00fb1c6a27d))

## [0.22.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.22.1...0.22.2) (2018-08-15)

### Bug Fixes

- **demo:** environment prod ([fb6e047](https://github.com/infra-geo-ouverte/igo2-lib/commit/fb6e047cf8d8270fea34badc65f0f515549ba828))

## [0.22.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.10...0.22.1) (2018-08-15)

### Bug Fixes

- Correct various bugs due to the passage of the new version ([e3a81e0](https://github.com/infra-geo-ouverte/igo2-lib/commit/e3a81e0de8941429b81b78fdc0bf2f6b8b36c395))
- **demo:** fix polyfills for ie ([566de5c](https://github.com/infra-geo-ouverte/igo2-lib/commit/566de5c4b7627f355cdd75adf6333d3082976b83))
- **download:** Fix for indefined value ([#158](https://github.com/infra-geo-ouverte/igo2-lib/issues/158)) ([f6c412a](https://github.com/infra-geo-ouverte/igo2-lib/commit/f6c412a2e51c397d60e32e562de6220234eb632e))
- **feature zoom:** add click SourceFeatureType ([#154](https://github.com/infra-geo-ouverte/igo2-lib/issues/154)) ([a7f7dcb](https://github.com/infra-geo-ouverte/igo2-lib/commit/a7f7dcb98d0f70826f12cd0586087f1ab8247415))
- **filter:** year list ([#151](https://github.com/infra-geo-ouverte/igo2-lib/issues/151)) ([5745a3f](https://github.com/infra-geo-ouverte/igo2-lib/commit/5745a3f7a26a82bb1eade1750a09d5c598fd2545))
- **layer-item:** Undefined download url ([#160](https://github.com/infra-geo-ouverte/igo2-lib/issues/160)) ([525a419](https://github.com/infra-geo-ouverte/igo2-lib/commit/525a4194148b877882fe9002a7f2a0f5b078f6a7))
- **ol:** add gulp command to fix openlayers ([34d16fd](https://github.com/infra-geo-ouverte/igo2-lib/commit/34d16fd4d26e671b5ad4f320f1453fc89d032440))
- **query.directive:** Fixing undefined clicked or dragged features ([#159](https://github.com/infra-geo-ouverte/igo2-lib/issues/159)) ([b6394a8](https://github.com/infra-geo-ouverte/igo2-lib/commit/b6394a8b84f79546d36a74eeecb041225750815a))
- **toast:** rename onOpened to opened output ([a16fe24](https://github.com/infra-geo-ouverte/igo2-lib/commit/a16fe247e7e5d57591c0a8c5b4bf7708dfa1f983))

### Features

- **backdrop:** add backdrop component ([40f6d7e](https://github.com/infra-geo-ouverte/igo2-lib/commit/40f6d7e96444d975f5229e6a3b697f014d2236cb))
- cut into small lib and upgrade to ol5 ([#173](https://github.com/infra-geo-ouverte/igo2-lib/issues/173)) ([3293ac8](https://github.com/infra-geo-ouverte/igo2-lib/commit/3293ac8d44fc534028c7aeb4769a2f26624064d3))
- **demo:** correct links for github.io ([0edc80d](https://github.com/infra-geo-ouverte/igo2-lib/commit/0edc80de0c3f3bea31a68ec7566c5988a9ec02c1))
- **feature:** Make features clickable ([#149](https://github.com/infra-geo-ouverte/igo2-lib/issues/149)) ([f668d78](https://github.com/infra-geo-ouverte/igo2-lib/commit/f668d781040d5faf1afff021246a2d86ea6b7ef6))
- **feature:** Manage drag box on feature select ([#157](https://github.com/infra-geo-ouverte/igo2-lib/issues/157)) ([e22e006](https://github.com/infra-geo-ouverte/igo2-lib/commit/e22e0066c59271537a083ac6d38f025b54fd5b7a))
- **flexible:** add flexible component ([101f973](https://github.com/infra-geo-ouverte/igo2-lib/commit/101f973ac58a5b6277af0fb6f56abd9bef589742))
- **reverse search:** Adding XY search by location on search-bar ([#155](https://github.com/infra-geo-ouverte/igo2-lib/issues/155)) ([2cd2bfa](https://github.com/infra-geo-ouverte/igo2-lib/commit/2cd2bfaa1b65a922a1b0bf8a322071b1ff910dc0))
- **search:** reverse geocode ([#153](https://github.com/infra-geo-ouverte/igo2-lib/issues/153)) ([67346b8](https://github.com/infra-geo-ouverte/igo2-lib/commit/67346b817a2e59e535022d71f6ad03cea682bb60))
- **sidenav:** add sidenav component ([1b91d38](https://github.com/infra-geo-ouverte/igo2-lib/commit/1b91d38f3a61ce63c812e134c550288ac3a93f10))
- **time-filter:** year support ([#148](https://github.com/infra-geo-ouverte/igo2-lib/issues/148)) ([4918ee6](https://github.com/infra-geo-ouverte/igo2-lib/commit/4918ee6ac95fb511360dae67f00c908f2c12e8c5))
- **toast:** add toast component ([ad2245d](https://github.com/infra-geo-ouverte/igo2-lib/commit/ad2245d87da4cfecff986db55e1642e06dc67ecb))

## [0.19.10](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.9...0.19.10) (2018-05-10)

### Reverts

- Revert "fix(font): remove external fonts" ([e70f102](https://github.com/infra-geo-ouverte/igo2-lib/commit/e70f102665b66b4aa6b5a4bdb50fba359b43332e))

## [0.19.9](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.8...0.19.9) (2018-05-09)

### Bug Fixes

- **ogc-filter:** Alignements and adding refresh controls ([#146](https://github.com/infra-geo-ouverte/igo2-lib/issues/146)) ([b4fb16f](https://github.com/infra-geo-ouverte/igo2-lib/commit/b4fb16f10afae39522d5e5ef1b4d50594a84eb08))

## [0.19.8](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.7...0.19.8) (2018-05-04)

### Bug Fixes

- **filter:** use good interface for layer-item ([55bf075](https://github.com/infra-geo-ouverte/igo2-lib/commit/55bf07536a2d70d3fc22c53da2920bf890cc7e0d))
- **geojson:** Geojson geometry type ([#145](https://github.com/infra-geo-ouverte/igo2-lib/issues/145)) ([64bd438](https://github.com/infra-geo-ouverte/igo2-lib/commit/64bd43875a2976d4d1d91cd8d30ec870166f59b7))
- **wmstime:** set only if min or max date is undefined ([#143](https://github.com/infra-geo-ouverte/igo2-lib/issues/143)) ([2878cea](https://github.com/infra-geo-ouverte/igo2-lib/commit/2878cea446651b80c35a4ea74b054f7cf8882628))

### Features

- **catalog:** Dig multiples levels in getCapabilities service ([#141](https://github.com/infra-geo-ouverte/igo2-lib/issues/141)) ([cf7c77d](https://github.com/infra-geo-ouverte/igo2-lib/commit/cf7c77d55718d470910b806cc10791192458ece1))
- **filter:** Ogc filter toolbar ([#142](https://github.com/infra-geo-ouverte/igo2-lib/issues/142)) ([bddf332](https://github.com/infra-geo-ouverte/igo2-lib/commit/bddf3323b02447061d67c2c1216ea41fb8ce9c68))

## [0.19.7](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.6...0.19.7) (2018-05-01)

### Bug Fixes

- **auth:** fix typeConnection typo ([4bbfd7d](https://github.com/infra-geo-ouverte/igo2-lib/commit/4bbfd7dd2708e596a61c783ddbd53f2aafec3fb5))
- **filter:** Set active status for empty filter array ([#139](https://github.com/infra-geo-ouverte/igo2-lib/issues/139)) ([17a16be](https://github.com/infra-geo-ouverte/igo2-lib/commit/17a16be9db7f4612f0b8bd21082708ea3813fccf))
- **filter:** wmstime init startdate value + css placeholder ([4c77841](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c77841354a5c8c13f5fe791677e1ac9920f1d72))
- **time-filter:** timeFilterForm implements onInit ([8c16aa6](https://github.com/infra-geo-ouverte/igo2-lib/commit/8c16aa6b23f3054b22de2458b15fc19a3c3d724a))

## [0.19.6](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.5...0.19.6) (2018-04-16)

### Bug Fixes

- **context:** replace wfs_test pattern with expression for EqualTo ([#138](https://github.com/infra-geo-ouverte/igo2-lib/issues/138)) ([89ee81c](https://github.com/infra-geo-ouverte/igo2-lib/commit/89ee81c25f6673a512d55fdb648408b98c4c8975))

## [0.19.5](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.4...0.19.5) (2018-04-13)

### Bug Fixes

- **filter:** fix typage ([b2ea1ad](https://github.com/infra-geo-ouverte/igo2-lib/commit/b2ea1adef3874f074be980a717a1d0a5a99dc69b))
- **filter:** wait for sourcefields ([#137](https://github.com/infra-geo-ouverte/igo2-lib/issues/137)) ([ff25d1e](https://github.com/infra-geo-ouverte/igo2-lib/commit/ff25d1e761916689de6b339928f5b0a15b7fd58e))
- fix hover button if disabled ([444239a](https://github.com/infra-geo-ouverte/igo2-lib/commit/444239a5cfb9ced0a47e8983bda9b16cf3807e9c))
- **ol:** fix ol.style.Style assertion ([76017f5](https://github.com/infra-geo-ouverte/igo2-lib/commit/76017f5f06825b415d22dfde069178045e2ceca5))

## [0.19.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.3...0.19.4) (2018-04-12)

### Bug Fixes

- **filter:** fix typage ([892380c](https://github.com/infra-geo-ouverte/igo2-lib/commit/892380c2228b97894d5c8754fa4721c26520504b))

### Features

- **context:** Updating embacle.json for wfs source ([#136](https://github.com/infra-geo-ouverte/igo2-lib/issues/136)) ([c46440c](https://github.com/infra-geo-ouverte/igo2-lib/commit/c46440c5e1c878108bf077a70fb87e2f1778a4f7))

## [0.19.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.1...0.19.3) (2018-04-12)

### Bug Fixes

- **legend:** add display key for DataSourceLegendOptions interface ([4564e29](https://github.com/infra-geo-ouverte/igo2-lib/commit/4564e29502677551f952211bd16324f94838052e))
- **wfs:** wrong URL (close [#134](https://github.com/infra-geo-ouverte/igo2-lib/issues/134)) ([a57dd15](https://github.com/infra-geo-ouverte/igo2-lib/commit/a57dd15b4c045bed8ddb38221b7001d2fcca193c))

### Features

- **context:** updating wfs-test context for ogcFilters's options. ([#135](https://github.com/infra-geo-ouverte/igo2-lib/issues/135)) ([964dfb7](https://github.com/infra-geo-ouverte/igo2-lib/commit/964dfb7cf7db9b8b2c7ed4b16b5f721610a311d8))

## [0.19.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.19.0...0.19.1) (2018-04-12)

### Bug Fixes

- **ol:** import ol in interface files ([a210fa0](https://github.com/infra-geo-ouverte/igo2-lib/commit/a210fa098f7723094282b97bd8219356455088fd))

# [0.19.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.18.0...0.19.0) (2018-04-11)

### Bug Fixes

- **demo:** fix get feature info ([a4438e8](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4438e84f61c0cab38126905ec68a13d01ad9d18))
- **panel:** fix directive panelBeforeTitle ([2edc2ea](https://github.com/infra-geo-ouverte/igo2-lib/commit/2edc2ea97e8cc19df049aecf7192416265fa433c))
- Replace olx with ol.olx ([#130](https://github.com/infra-geo-ouverte/igo2-lib/issues/130)) ([3f56799](https://github.com/infra-geo-ouverte/igo2-lib/commit/3f56799c412a4cf40d47b05fbd117a95689214dc))
- **wfs:** wfsGetCapabilities ([b1d07b6](https://github.com/infra-geo-ouverte/igo2-lib/commit/b1d07b64a8e649d1d849602a69251c15cc574a8a))

### Features

- **ogc-filter:** Addind a UI for ogc filters ([#132](https://github.com/infra-geo-ouverte/igo2-lib/issues/132)) ([9c57dff](https://github.com/infra-geo-ouverte/igo2-lib/commit/9c57dff1ff683292e628b8aaa68ae8dde7e3dcda))
- **shareMap:** add icon ([2cc11aa](https://github.com/infra-geo-ouverte/igo2-lib/commit/2cc11aa4947a8715df71cca78a29b2634d7ab61e))

# [0.18.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.17.1...0.18.0) (2018-04-05)

### Bug Fixes

- **message:** offset on iphone 5 ([e87c00c](https://github.com/infra-geo-ouverte/igo2-lib/commit/e87c00c38e798cd7f7a2807341b8f9d05bd3ae7b))
- **message:** set default icon ([da68e61](https://github.com/infra-geo-ouverte/igo2-lib/commit/da68e61b3873fb145af0dce15b9ec788edb07b86))

### Features

- **message:** can pass templateRef to message service ([7c1773c](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c1773c0032be7838410e8d5b3680297643af6cd))
- **message:** change default template ([e63f19c](https://github.com/infra-geo-ouverte/igo2-lib/commit/e63f19cf2a963e945fab396d1c6fab8bc093d1d1))
- **message:** remove padding when no icon ([9c23ee5](https://github.com/infra-geo-ouverte/igo2-lib/commit/9c23ee5aacbd63b8659c0676f73106a783f312b4))
- **query:** queryService is now independant of the featureService ([8d31be9](https://github.com/infra-geo-ouverte/igo2-lib/commit/8d31be93a7214c9e0d8ae90c4d0314f630a44936))
- **query:** return map click event ([07e2dc7](https://github.com/infra-geo-ouverte/igo2-lib/commit/07e2dc7a579f59bd0194454d21a0a2f46aa87c96))
- rxjs: use deep imports and use pipeable operators everywhere ([041a899](https://github.com/infra-geo-ouverte/igo2-lib/commit/041a89975c06206f36b2f4e3749027fe1b8b1ab3))

## [0.17.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.17.0...0.17.1) (2018-03-22)

### Bug Fixes

- **query:** no query if resolution is out of range ([15ae113](https://github.com/infra-geo-ouverte/igo2-lib/commit/15ae1134f9cefa7dc6afe2f0719b3a59e97a556f))
- **watcher:** fix watcher layers ([#128](https://github.com/infra-geo-ouverte/igo2-lib/issues/128)) ([572c84d](https://github.com/infra-geo-ouverte/igo2-lib/commit/572c84d4002d86d6219910d9877cdc02d5b6263d))

### Features

- **analytics:** add matomo to analyse website ([575b62c](https://github.com/infra-geo-ouverte/igo2-lib/commit/575b62c90d3946b3acea42be1996a32a2918ddd0))

# [0.17.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.16.0...0.17.0) (2018-03-21)

### Bug Fixes

- **query:** log error when unable to parse geojson ([94f908f](https://github.com/infra-geo-ouverte/igo2-lib/commit/94f908f2c780fdc4b2824307bab7e48630240ba7))

# [0.16.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.15.0...0.16.0) (2018-03-15)

### Bug Fixes

- **baselayers-switcher:** change icon ([4f6dc7a](https://github.com/infra-geo-ouverte/igo2-lib/commit/4f6dc7a768c7352a8e8dc7565137e32ff9d53a65))
- **featuresList:** sort in feature.service ([54a685d](https://github.com/infra-geo-ouverte/igo2-lib/commit/54a685d4002d0199762369760a50476447bf48a3))
- **font:** remove external fonts ([0c63f1a](https://github.com/infra-geo-ouverte/igo2-lib/commit/0c63f1a967c684de6676dad238ef41677e4ed631))
- **ie:** fix css for ie ([8ad4667](https://github.com/infra-geo-ouverte/igo2-lib/commit/8ad46677e1f609e60a30e853c5961fe5cd56919f))
- **minimap:** fix title for ie ([0303899](https://github.com/infra-geo-ouverte/igo2-lib/commit/0303899edd888b27b57957275f49a2928b8043d3))
- **query:** inverse order ([b5bd402](https://github.com/infra-geo-ouverte/igo2-lib/commit/b5bd40268d49c9fe33a07ed8d864417454f1ea06))
- **search-bar:** conflict between text and icon ([ccf19c1](https://github.com/infra-geo-ouverte/igo2-lib/commit/ccf19c1e656f911dbf239058b20041baf5c434e6))
- **toolbar:** double tooltip ([af5198a](https://github.com/infra-geo-ouverte/igo2-lib/commit/af5198a8ec2c30cf2ec1446cce5d58169d361b5e))

### Features

- **auth:** secure token with trust hosts ([89bd0f2](https://github.com/infra-geo-ouverte/igo2-lib/commit/89bd0f28c541fa521e7c60ffbe2597e40e84f85d))
- **baselayerSwitcher:** user static icon instead of minimap on mobile ([366e9b1](https://github.com/infra-geo-ouverte/igo2-lib/commit/366e9b134d9093cd47bd49048d6f4c999073ac5d))
- **legend:** add an option to no display the legend ([0c74486](https://github.com/infra-geo-ouverte/igo2-lib/commit/0c7448662a6900ddc221c0452d9588e6f51e1a4b))
- **media:** add ie media filter ([7f4719f](https://github.com/infra-geo-ouverte/igo2-lib/commit/7f4719f9412144b0992ce83621d1915a419cfb8a))
- **message-center:** add some options (id, class, timeOut) ([558ab20](https://github.com/infra-geo-ouverte/igo2-lib/commit/558ab20da37e3f0ef4ba631420fca72603de0407))
- **message-center:** move icon parameter to options ([4313fd9](https://github.com/infra-geo-ouverte/igo2-lib/commit/4313fd969e26f9872e1837c91ac98be9929bfe43))
- **message:** can remove a message by id ([9479cbd](https://github.com/infra-geo-ouverte/igo2-lib/commit/9479cbd24fdd1b6875f3257c3a1e64d1bc03913d))
- **panel:** add content before or after title ([f724df6](https://github.com/infra-geo-ouverte/igo2-lib/commit/f724df610927b697df63bb43486e922e0516e96e))

# [0.15.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.14.0...0.15.0) (2018-03-05)

### Bug Fixes

- **attribution:** fix set collapse ([cce3c70](https://github.com/infra-geo-ouverte/igo2-lib/commit/cce3c70c14b58666efac234e9a0d3600a24a40bf))
- **auth:** don't send token when is null ([dd65dd1](https://github.com/infra-geo-ouverte/igo2-lib/commit/dd65dd1fd7285eba939324ec8ffb40817e41b044))
- **basemap:** title at the bottom ([f94b468](https://github.com/infra-geo-ouverte/igo2-lib/commit/f94b468e59f0a26f5c20b360fab78210b47e2d14))
- **context.json:** remove duplicate context ([9dacb9d](https://github.com/infra-geo-ouverte/igo2-lib/commit/9dacb9d7a93ec6a6639a92fb95dfa43da73ca588))
- fix some minor styles ([729e319](https://github.com/infra-geo-ouverte/igo2-lib/commit/729e319d9ebd8b23cd7384716c08a2d90a7da367))
- **legend:** use token with image tag ([e1cd461](https://github.com/infra-geo-ouverte/igo2-lib/commit/e1cd4616ac67e73c65a1d4e5138dd4d7d6eceb47))
- **map:** use default options if not define ([ccac803](https://github.com/infra-geo-ouverte/igo2-lib/commit/ccac80397ba16832f9c3f48c00933d6da27f31a6))
- **minimap:** remove all map controls ([04ff16e](https://github.com/infra-geo-ouverte/igo2-lib/commit/04ff16ee708489fc7a99b5fc8ebdb660b100ffc0))
- **share-map:** remove sharemap button when not auth ([d817693](https://github.com/infra-geo-ouverte/igo2-lib/commit/d81769344631a1e91aa93c23837a9fb7c1eed50d))
- **shareMap:** fix share map ([3dd2a4d](https://github.com/infra-geo-ouverte/igo2-lib/commit/3dd2a4d1419e15298bdb800fa146edd1bc9830e0))
- **toolService:** allow custom tools ([cd7e8d7](https://github.com/infra-geo-ouverte/igo2-lib/commit/cd7e8d7dd716b2f02dff5dfbac496f2c70ca0c1a))

### Features

- **clipboard:** copy text to clipboard is working in all browsers ([79b1f75](https://github.com/infra-geo-ouverte/igo2-lib/commit/79b1f75f74afbeda731a37d86d0bcdd9fd3e394a))
- **control:** add attibutioncollapse view config ([2adac26](https://github.com/infra-geo-ouverte/igo2-lib/commit/2adac26ed60bd4df7581a5791338cde0e4e0cec1))
- **errorInterceptor:** add handle uncaught error ([0675d11](https://github.com/infra-geo-ouverte/igo2-lib/commit/0675d11869d08a9b048008c106b13861dcd6629c))
- **feature-list:** grouping features is now optional ([bf05e43](https://github.com/infra-geo-ouverte/igo2-lib/commit/bf05e43fd205f1b69242bd3f82b675a9a8d6db77))
- **featuresList:** sort by zIndex ([0b56b68](https://github.com/infra-geo-ouverte/igo2-lib/commit/0b56b68b50e00a331ce57cf9219cca63d41a0ee3))
- **icherche:** add type to search source ([3b0caeb](https://github.com/infra-geo-ouverte/igo2-lib/commit/3b0caeb961736264eef9630653d89bc60b1497dc))
- **interceptor:** provide interceptor ([5d67739](https://github.com/infra-geo-ouverte/igo2-lib/commit/5d677393d63751734c17f8f9388b7d5e94cf4e14))
- **list:** support image icon (png) ([5dead1a](https://github.com/infra-geo-ouverte/igo2-lib/commit/5dead1a5ff6bf387de531cccff24f9ef8a4cddc1))
- **map:** add scaleline ([1a25e8f](https://github.com/infra-geo-ouverte/igo2-lib/commit/1a25e8f8bbef8cd19cfed2e7a3051e0da93a73ec))
- **map:** add tooltip to button ([2cc33bb](https://github.com/infra-geo-ouverte/igo2-lib/commit/2cc33bb8d9cb7edfd173da2230cfcd5291e249a5))
- **map:** overlay style can be changed ([5222806](https://github.com/infra-geo-ouverte/igo2-lib/commit/5222806630055975e79b1de2a46960ab07eb473c))
- **message-center:** icon at left and add option to add close icon ([5a96a85](https://github.com/infra-geo-ouverte/igo2-lib/commit/5a96a8542ac6f27b107287354dfd3d1215f2a626))
- **minimap:** title on multiple lines ([8031e05](https://github.com/infra-geo-ouverte/igo2-lib/commit/8031e05e0e6f5fec6fe990658decf9162cb46ad8))
- **scaleline:** scaleline is now optional ([64dda28](https://github.com/infra-geo-ouverte/igo2-lib/commit/64dda28fc168b5f8f222a17e038f250fb68d994c))
- **search-bar:** add optional search icon ([c53b2da](https://github.com/infra-geo-ouverte/igo2-lib/commit/c53b2da5e20a48229326c19d9ebd4b36b6d56f4d))
- **search-bar:** fill search bar when feature is selected ([73d0cdd](https://github.com/infra-geo-ouverte/igo2-lib/commit/73d0cdd68784ff94a2541ff739a855444a05fb48))
- **share-map-tool:** pass options to the component ([531b188](https://github.com/infra-geo-ouverte/igo2-lib/commit/531b18870c62e7425016a553b7b0760f6e74973e))
- **shareMap:** add message error ([958dd2d](https://github.com/infra-geo-ouverte/igo2-lib/commit/958dd2d161dc8a168ef268f9f4c855c2bc03563b))
- **wfs:** creating an indepedant source for from wfs-datasource ([#120](https://github.com/infra-geo-ouverte/igo2-lib/issues/120)) ([96f66e1](https://github.com/infra-geo-ouverte/igo2-lib/commit/96f66e18bf1275334dfc0617ed3f9ac9f08538cd))

# [0.14.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.13.3...0.14.0) (2018-02-02)

### Features

- upgrade dependencies ([#118](https://github.com/infra-geo-ouverte/igo2-lib/issues/118)) ([292e4dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/292e4dceb90b517f17659499dbcbb9ac2148dd5c))

## [0.13.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.13.2...0.13.3) (2018-01-26)

### Features

- **time-filter-form:** input date value, hidden clear button. ([#117](https://github.com/infra-geo-ouverte/igo2-lib/issues/117)) ([f94ccad](https://github.com/infra-geo-ouverte/igo2-lib/commit/f94ccad5051aec5956415715ec783c93d2d14359))

## [0.13.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.13.1...0.13.2) (2018-01-25)

### Bug Fixes

- **getFeatureInfo:** polygon ((NaN,...)) for html getfeatureinfo ([#115](https://github.com/infra-geo-ouverte/igo2-lib/issues/115)) ([dfa674b](https://github.com/infra-geo-ouverte/igo2-lib/commit/dfa674b2aaf1f1ea7047dda9c9ac54d33668f8de))

## [0.13.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.13.0...0.13.1) (2018-01-25)

### Bug Fixes

- **ie11:** fix getFeatureInfo html ([5cd8f56](https://github.com/infra-geo-ouverte/igo2-lib/commit/5cd8f5692538874cb710830f552d125f16b3899d))
- **importExport:** fix vectorLayer detection ([a4dbb06](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4dbb0645da5ff3b4748592a5810681c8036db53))

# [0.13.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.12.2...0.13.0) (2018-01-12)

### Bug Fixes

- **share-map:** fix ie11 ([a26ebf9](https://github.com/infra-geo-ouverte/igo2-lib/commit/a26ebf99e0649eef371492d8a769bddd6762021b))

### Features

- **baselayer-switcher:** show minimap only if in resolutions range ([581cf00](https://github.com/infra-geo-ouverte/igo2-lib/commit/581cf0038d2f9e4b83f4768fd4adb2501c3d489e))
- **context:** always keep context by default in context list ([258ff53](https://github.com/infra-geo-ouverte/igo2-lib/commit/258ff53d1e9ec90f118fa1f78bde1a8e4d4b1f85))
- **importExport:** add import and export features and vectorlayer list ([876dc31](https://github.com/infra-geo-ouverte/igo2-lib/commit/876dc31993f7aaabc5984ca10c17c295b36f5487))

## [0.12.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.12.1...0.12.2) (2017-12-07)

### Bug Fixes

- **layer:** This suscribe was not referencing to named id ([#113](https://github.com/infra-geo-ouverte/igo2-lib/issues/113)) ([1e353fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/1e353fc229860018986d42bfd42fb1a8fcc5797b))
- **spinner:** propagate the click to the button below ([58e17b5](https://github.com/infra-geo-ouverte/igo2-lib/commit/58e17b5d729e1852e2d581f9e35ec9874edbd26e))

## [0.12.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.12.0...0.12.1) (2017-12-06)

### Bug Fixes

- **getFeatureInfo:** update due to an inconsistent slice behavior for empty html ([#112](https://github.com/infra-geo-ouverte/igo2-lib/issues/112)) ([18aa2db](https://github.com/infra-geo-ouverte/igo2-lib/commit/18aa2dba441e46679e85d98af6abb901f82a027e))
- **media:** mobile landscape ([83dba8b](https://github.com/infra-geo-ouverte/igo2-lib/commit/83dba8bbf43edd9c571727a909701d209a9dfa6e))
- **shareMap:** inverse visible and invisible layers ([ce88b6b](https://github.com/infra-geo-ouverte/igo2-lib/commit/ce88b6be8c364bb4373184dba6dd3dd505d5db0c))

# [0.12.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.11.0...0.12.0) (2017-12-06)

### Bug Fixes

- **baselayer:** baselayer is not visible by default ([8c4e72b](https://github.com/infra-geo-ouverte/igo2-lib/commit/8c4e72be4daf31ba273b927a24855cf3125125e5))
- **context:** context default always loaded ([3589d2b](https://github.com/infra-geo-ouverte/igo2-lib/commit/3589d2b59ceff4028580dd5d116708633420584e))
- **context:** keep the inputs object intact ([52e725e](https://github.com/infra-geo-ouverte/igo2-lib/commit/52e725e691bac33d60446fa0baf1e70ad43c10e3))
- **context:** load only one context when defined in the url ([699a85b](https://github.com/infra-geo-ouverte/igo2-lib/commit/699a85bc62d3b9cf2df52eaf17f78313fdbd8a4b))
- **geolocate:** fix missing feature bug ([6b199e2](https://github.com/infra-geo-ouverte/igo2-lib/commit/6b199e24ec310e9d35a3ed07cf3bbf5b3e84ca13))
- **getFeatureInfo:** fix build lib ([c2a1a19](https://github.com/infra-geo-ouverte/igo2-lib/commit/c2a1a1931bd019e190d5e8c8628cd44a8d501613))
- **layer:** define a layer id in json context ([f915ff9](https://github.com/infra-geo-ouverte/igo2-lib/commit/f915ff9b7d1144b6a51c88354bf75c0b9167ac43))
- **query:** To avoid empty html returns. ([#104](https://github.com/infra-geo-ouverte/igo2-lib/issues/104)) ([d49a877](https://github.com/infra-geo-ouverte/igo2-lib/commit/d49a8778be89fd2b8bf4868d846d02e94583e07c))
- **wmst:** css, style, pointer ([#103](https://github.com/infra-geo-ouverte/igo2-lib/issues/103)) ([cae1668](https://github.com/infra-geo-ouverte/igo2-lib/commit/cae1668804fd8955f8f5ba666640149be6210a60))
- **wmstime:** css, wmstime datetime format, x button ([#105](https://github.com/infra-geo-ouverte/igo2-lib/issues/105)) ([ea895dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/ea895dceec244c724f97797cf0ba20b039e59f42))

### Features

- add delay before showing the tooltip ([ed45862](https://github.com/infra-geo-ouverte/igo2-lib/commit/ed458628171f843cf26614a250de6e3f8eb353c1))
- **baselayer-switcher:** add images to change baselayers ([7f45cac](https://github.com/infra-geo-ouverte/igo2-lib/commit/7f45cac071c51c409e85c616326c3aeeeeb4a0cd))
- **baselayers:** rewrite baselayer and add in catalog ([911103f](https://github.com/infra-geo-ouverte/igo2-lib/commit/911103f043a72d45d57fa9f71bc3529a01eedcbb))
- **context:** add uri to form context ([8d7c9d9](https://github.com/infra-geo-ouverte/igo2-lib/commit/8d7c9d9596bbc44926506538d56d5e22e529c3cb))
- **getFeatureInfo:** entire content instead of only body ([#111](https://github.com/infra-geo-ouverte/igo2-lib/issues/111)) ([0abf413](https://github.com/infra-geo-ouverte/igo2-lib/commit/0abf4132eb4b2dd07ad686cb8c4224d0152a9649))
- **layer:** Adding route param invisiblelayers and visiblelayers ([#106](https://github.com/infra-geo-ouverte/igo2-lib/issues/106)) ([2667ac3](https://github.com/infra-geo-ouverte/igo2-lib/commit/2667ac33099cae0a7fef326a52347a3d103722db))
- **layer:** rewrite route param visiblelayers ([b6a7995](https://github.com/infra-geo-ouverte/igo2-lib/commit/b6a7995542f94df3a35f69815228b54a138167ef))
- **share-map:** add share map tool ([e277007](https://github.com/infra-geo-ouverte/igo2-lib/commit/e277007be3efe86ffde0f9eddc954a7822245044))

# [0.11.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.10.2...0.11.0) (2017-11-14)

### Bug Fixes

- **css:** wmstime-slider ([#98](https://github.com/infra-geo-ouverte/igo2-lib/issues/98)) ([22c21fa](https://github.com/infra-geo-ouverte/igo2-lib/commit/22c21fa3ad07f414f907cf7666cdb29e3d4aaa59))
- **feature:** getinfo too sensitive for html ([5e42c4c](https://github.com/infra-geo-ouverte/igo2-lib/commit/5e42c4c04115197046b659c88cbf192c82351016))
- **poi:** convert coordinate string to number ([2f96d69](https://github.com/infra-geo-ouverte/igo2-lib/commit/2f96d69b6ea1d7cfa7f74457126f1f8a70bfe912))
- **slider:** wmstime slider min value ([#99](https://github.com/infra-geo-ouverte/igo2-lib/issues/99)) ([7b67e4b](https://github.com/infra-geo-ouverte/igo2-lib/commit/7b67e4bbc520fe4f3c8824af8d3291d435f8bec5))
- **wmst:** fix wmst startdate, capabilites-wmst no dimension ([#95](https://github.com/infra-geo-ouverte/igo2-lib/issues/95)) ([b868cb0](https://github.com/infra-geo-ouverte/igo2-lib/commit/b868cb0ec25a1b2df94c0bb8943c4a9c95609255))

### Features

- **context:** add a favorite context for each user ([fcf0386](https://github.com/infra-geo-ouverte/igo2-lib/commit/fcf0386d2e256cc621bd01a97b4cf6492ccc9597))

## [0.10.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.10.1...0.10.2) (2017-11-03)

### Bug Fixes

- **timefilter:** issue [#91](https://github.com/infra-geo-ouverte/igo2-lib/issues/91) ([e46a21a](https://github.com/infra-geo-ouverte/igo2-lib/commit/e46a21a2436282ce7c7e7a2958a029f1e18844a3))

## [0.10.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.10.0...0.10.1) (2017-11-03)

### Bug Fixes

- **time-filter:** Property params does not exist on type FilterableDataSourceOptions ([ec3d4f6](https://github.com/infra-geo-ouverte/igo2-lib/commit/ec3d4f6d1e6f4793e0bf3b6e2e07d4b3e939b008))

# [0.10.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.9.4...0.10.0) (2017-11-03)

## [0.9.4](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.9.3...0.9.4) (2017-09-20)

### Bug Fixes

- **catalog:** add catalogs by config json ([7f307a0](https://github.com/infra-geo-ouverte/igo2-lib/commit/7f307a0de816426ee7deb855e9b087fef31dc187))
- **context:** fix url context ([a60e823](https://github.com/infra-geo-ouverte/igo2-lib/commit/a60e82320bd8b239c053ae318c141d56594e4ee6))

## [0.9.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.9.2...0.9.3) (2017-09-15)

### Features

- **auth:** only show auth form if define in config ([bb496a5](https://github.com/infra-geo-ouverte/igo2-lib/commit/bb496a5a7f7afef7e56dfe74f5f60cbe63b53b01))
- **search-source:** clean search-source return ([158c7e0](https://github.com/infra-geo-ouverte/igo2-lib/commit/158c7e0d60a8b1971468220c6ebcd04f1377082a))

## [0.9.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.9.1...0.9.2) (2017-09-08)

### Bug Fixes

- **context:** save button saves also view ([f3a991f](https://github.com/infra-geo-ouverte/igo2-lib/commit/f3a991faeefd4c3dbaa15b7759bd2607223e8ad5))
- **getInfo:** get info returns the first 10 elements ([20c096b](https://github.com/infra-geo-ouverte/igo2-lib/commit/20c096b1a4b36531d71a093a7512bece8b252dc8))
- **layer-watcher:** fix count when remove layer ([2d320c5](https://github.com/infra-geo-ouverte/igo2-lib/commit/2d320c594f240a78d654c4002141f30836618c1c))

### Features

- **auth:** refresh contexts list when login or logout ([97d37c7](https://github.com/infra-geo-ouverte/igo2-lib/commit/97d37c71130402ae12cc97d8ca3ef1d191f38a98))
- **layer:** save visibility ([b352b3a](https://github.com/infra-geo-ouverte/igo2-lib/commit/b352b3a3c150e73766eedc70c6f33c0d26bce7c1))
- **poi:** zoom on click instead of on change ([17a7eb5](https://github.com/infra-geo-ouverte/igo2-lib/commit/17a7eb5ae855b11073d54d8a4447e8e4fd331496))

## [0.9.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.9.0...0.9.1) (2017-09-01)

### Bug Fixes

- fix prod build ([8f692fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/8f692fccb3ec6aacde1636999f18656673a18164))

# [0.9.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.8.1...0.9.0) (2017-09-01)

### Bug Fixes

- **animation:** fix animation after update angular ([8e7d7f6](https://github.com/infra-geo-ouverte/igo2-lib/commit/8e7d7f6eeee046039e07faaa12c8070d461d7770))
- **auth:** show message error ([af79cca](https://github.com/infra-geo-ouverte/igo2-lib/commit/af79cca984851b9f913da7979065d85b2fcb6e0a))
- **dependency:** fix circulars dependencies ([8e103f6](https://github.com/infra-geo-ouverte/igo2-lib/commit/8e103f6bf1078092a3964dd4660923016d1dff06))
- **form:** rename md-input-container to md-form-field ([3d90f6e](https://github.com/infra-geo-ouverte/igo2-lib/commit/3d90f6e9c39897024f83e4932ea6cf4646513ff2))
- **layer:** keep order layers after save or clone ([1cbd693](https://github.com/infra-geo-ouverte/igo2-lib/commit/1cbd6931a4d8d7d482a90e4b54a80d121ae77edf))
- **media:** ajust width for mobile media ([17f6f36](https://github.com/infra-geo-ouverte/igo2-lib/commit/17f6f36e183dcc80238355cb387847b0075fbbba))
- **mobile:** fix tools maps position on mobile ([06730cd](https://github.com/infra-geo-ouverte/igo2-lib/commit/06730cdb480719cc08dfb50bbe45547d687fb210))

### Features

- **auth:** add anonymous login ([e7a6a4d](https://github.com/infra-geo-ouverte/igo2-lib/commit/e7a6a4debef0529a46d03eb63fba5df1758266e2))
- **auth:** add authentication form and service ([c5b20ec](https://github.com/infra-geo-ouverte/igo2-lib/commit/c5b20ecfdb8bb323106489d33aba1de848374cba))
- **auth:** add authentication form and service ([468b5c8](https://github.com/infra-geo-ouverte/igo2-lib/commit/468b5c822dc595d59e9e774f39189896ffa7a61f))
- **auth:** call service with token ([d028163](https://github.com/infra-geo-ouverte/igo2-lib/commit/d028163be2eb5b372f6e2e45d80d3962a1089b1a))
- **bookmark:** add map tool to create new context ([6436510](https://github.com/infra-geo-ouverte/igo2-lib/commit/6436510a44c9c268dd7f2f0a72ce514fc90e75df))
- **catalog:** add catalog tool ([4c9a7d1](https://github.com/infra-geo-ouverte/igo2-lib/commit/4c9a7d1fff8deaef61f70052ca8bd7ee55d92ead))
- **confirm-dialog:** add confirm dialog component ([8a96e14](https://github.com/infra-geo-ouverte/igo2-lib/commit/8a96e147987b883131708ab3c6191062a7d36d6f))
- **context:** add context editor components ([83e7942](https://github.com/infra-geo-ouverte/igo2-lib/commit/83e794291b03229a2d658e9997fe5661897d1158))
- **context:** remove buttons when anonyme ([bdd5bff](https://github.com/infra-geo-ouverte/igo2-lib/commit/bdd5bff71c5facccb6cf45d7463e6ef91d211e2e))
- **context:** use api to retrieve contexts ([fbe6d10](https://github.com/infra-geo-ouverte/igo2-lib/commit/fbe6d100bcc419176dbf3d1fb82a94b49d97b461))
- **dialog:** add confirm dialog component ([7c678e3](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c678e3db79c03dcc631f0ccab506da435b26d7b))
- **gelocate:** add geolocation button ([63a099f](https://github.com/infra-geo-ouverte/igo2-lib/commit/63a099f946542814e78b0de470f3b284112f52e2))
- **legend:** retrieve legend only if displayed ([da3509c](https://github.com/infra-geo-ouverte/igo2-lib/commit/da3509c090bcd18be71c7809eb70bf22ad7f5160))
- **message-center:** add types message ([57b3884](https://github.com/infra-geo-ouverte/igo2-lib/commit/57b38844bdab592e884025b1f1cd63200160ac36))
- **stop-propagation:** add stop propagation directive ([7324243](https://github.com/infra-geo-ouverte/igo2-lib/commit/73242435a76c6b0dbba2d3d2eac1c3c877e2b911))
- **table:** add generic table component ([2bdafd8](https://github.com/infra-geo-ouverte/igo2-lib/commit/2bdafd8485c71baf003bcb362d0dec2df0d888b0))
- **tooltip:** add tooltip to tools map ([32c3036](https://github.com/infra-geo-ouverte/igo2-lib/commit/32c3036c4c11b4538e24db6b5ff9a841e794c4c0))
- **user:** add user button on map ([379b757](https://github.com/infra-geo-ouverte/igo2-lib/commit/379b7579951c9835acf2435d8eefde283d8963e9))

## [0.8.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.8.0...0.8.1) (2017-06-27)

### Features

- **package:** upgrade [@angular](https://github.com/angular) material to beta.7 ([ec9d201](https://github.com/infra-geo-ouverte/igo2-lib/commit/ec9d20138f090b3a1c3143b297fdb79cbf2311ce))
- **searchbar:** disable native autocomplete ([97810e1](https://github.com/infra-geo-ouverte/igo2-lib/commit/97810e1363431cedd1bf80d96b37c1a44acd0631))
- **searchbar:** focus on searchbar after clear search text ([c505601](https://github.com/infra-geo-ouverte/igo2-lib/commit/c5056016141bc9f3c639fd6e9644365ad3702b74))

# [0.8.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.7.0...0.8.0) (2017-06-27)

### Bug Fixes

- **geolocate:** geolocate when changing context ([e1f91a9](https://github.com/infra-geo-ouverte/igo2-lib/commit/e1f91a9ef1a09eccc249f213c7eb295bb0be6b6c))
- **ie:** fix material-font import in ie ([f3946bc](https://github.com/infra-geo-ouverte/igo2-lib/commit/f3946bcd142ef6df36f2104239b02034970db288))

### Features

- **feature-details:** can receive html ([5e9ed5f](https://github.com/infra-geo-ouverte/igo2-lib/commit/5e9ed5f56df8cccd3a52e918785a5088655220ab))
- **geolocate:** add option to get position of device ([c5f23e8](https://github.com/infra-geo-ouverte/igo2-lib/commit/c5f23e81dcf2ba0369db47aef2e030909a2b4e15))
- **list:** long title is displayed on 2 lines ([d7f9414](https://github.com/infra-geo-ouverte/igo2-lib/commit/d7f94140f8f919c0bf19f4a71b478390c1d7a45a))
- **query:** query only layers that are shown on map ([561b0a5](https://github.com/infra-geo-ouverte/igo2-lib/commit/561b0a56eb0a7a051ca7924cfe73bf920dea65c7))

# [0.7.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.5.1...0.7.0) (2017-06-12)

### Bug Fixes

- **capabilities:** fix getCapabilities function ([c4a4f3c](https://github.com/infra-geo-ouverte/igo2-lib/commit/c4a4f3cb91bd9ffb37cb4305a9cfdedf8cd580e3))
- **layer:** transform scale to resolution from wms getCapabilities ([05e616f](https://github.com/infra-geo-ouverte/igo2-lib/commit/05e616f68c1e85e2233c01119f117cbceddfd276))
- **message-center:** fix message center ([#69](https://github.com/infra-geo-ouverte/igo2-lib/issues/69)) ([21498a7](https://github.com/infra-geo-ouverte/igo2-lib/commit/21498a7ecfd897f27121b6a5434f2aba58bc7a51))
- **mobile:** fix flex and keyup ([251e570](https://github.com/infra-geo-ouverte/igo2-lib/commit/251e570b6d0d9dbf0d05d3e508ee3dd7cb84a61b))

### Features

- **config:** add config service to manage the application ([#65](https://github.com/infra-geo-ouverte/igo2-lib/issues/65)) ([fddefb7](https://github.com/infra-geo-ouverte/igo2-lib/commit/fddefb720d565100088b6faee0a86f4f092c4cbd))
- **config:** move providerOptions to config ([#66](https://github.com/infra-geo-ouverte/igo2-lib/issues/66)) ([5a21cfa](https://github.com/infra-geo-ouverte/igo2-lib/commit/5a21cfa51d5c5c36554e3d6ac00b35f5b3277a2e))
- **feature:** clear function now also unselected and unfocus feature ([e2e17ca](https://github.com/infra-geo-ouverte/igo2-lib/commit/e2e17cadd9bb77a2b813c714e9a214575c2f6185))
- **layer-list:** show layers that are not in range of resolutions ([36c04b4](https://github.com/infra-geo-ouverte/igo2-lib/commit/36c04b44d8d770480dae79731db88f3b91d81712))
- **layer:** update material visibility icon ([#67](https://github.com/infra-geo-ouverte/igo2-lib/issues/67)) ([1861f24](https://github.com/infra-geo-ouverte/igo2-lib/commit/1861f24da51dd8d53045fdd4739d66a08762fb0b))
- **search:** clear old results when searching or querying ([ed66eab](https://github.com/infra-geo-ouverte/igo2-lib/commit/ed66eab364ba6577b667b45621e7d982218b6bf7))

## [0.5.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.5.0...0.5.1) (2017-05-31)

### Bug Fixes

- **layer-item:** Property metadata does not exist on type LayerOptions ([0db4ad4](https://github.com/infra-geo-ouverte/igo2-lib/commit/0db4ad41ad4fa80d01c6bfb233d82a63cfc6d15e))

# [0.5.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.4.3...0.5.0) (2017-05-31)

### Bug Fixes

- **query:** fix query details that are not updated ([a3e76bb](https://github.com/infra-geo-ouverte/igo2-lib/commit/a3e76bb9c504dd94eb6bb8c6de55c74301518783))
- **route.service:** fix return type queryParams ([e0352c9](https://github.com/infra-geo-ouverte/igo2-lib/commit/e0352c97796cb0576217c3b98bc516c23f20f176))

### Features

- **metadata:** add metadata for layers ([10c2694](https://github.com/infra-geo-ouverte/igo2-lib/commit/10c269486f6c98633c241e1d0dabe8f4402b19ce))
- **translate:** add a way to get translations ([#63](https://github.com/infra-geo-ouverte/igo2-lib/issues/63)) ([1b0878f](https://github.com/infra-geo-ouverte/igo2-lib/commit/1b0878fae2fed1d5abaa612f877f55902aa7da3c))
- **urlParams:** add url params to define map view and context ([#60](https://github.com/infra-geo-ouverte/igo2-lib/issues/60)) ([9c11f37](https://github.com/infra-geo-ouverte/igo2-lib/commit/9c11f378134d1232ce40a5fd44a7c823b7bc6d25))

## [0.4.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.4.2...0.4.3) (2017-05-16)

### Bug Fixes

- **layer:** fix layer watcher scope issue ([96c8ed3](https://github.com/infra-geo-ouverte/igo2-lib/commit/96c8ed3c3793fffc285e2da6f5f7b5b2a2449f1b))

## [0.4.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.4.1...0.4.2) (2017-05-15)

### Bug Fixes

- **feature:** focused feature not properly focused in toolbox ([c2d88fe](https://github.com/infra-geo-ouverte/igo2-lib/commit/c2d88fea340a25142be19b4f549a360d4955f971))
- **feature:** keep selected feature when opening a feature list ([a4391dc](https://github.com/infra-geo-ouverte/igo2-lib/commit/a4391dc36c9f9560324249d650cdb66a58cce02d))

### Features

- **material:** upgrade material ([71c06a6](https://github.com/infra-geo-ouverte/igo2-lib/commit/71c06a6ebfee81b58b2444c7b524691f61fedbbf))

## [0.4.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.4.0...0.4.1) (2017-05-12)

# [0.4.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.3.3...0.4.0) (2017-05-11)

### Bug Fixes

- **build:** fix provider search exports ([9a3703a](https://github.com/infra-geo-ouverte/igo2-lib/commit/9a3703abc6dccf8eb589383f4f27d6fd7c4cb52f))
- **search:** fix unsubcribe issue that prevented the lib from working ([9d302a1](https://github.com/infra-geo-ouverte/igo2-lib/commit/9d302a13a7ef7e8251c5d0764a342e40e94097f3))
- **search:** limit as string ([2f7a896](https://github.com/infra-geo-ouverte/igo2-lib/commit/2f7a89604b597651e68d88b6285887081546e865))
- **typo:** add missing this ([42b2432](https://github.com/infra-geo-ouverte/igo2-lib/commit/42b2432baf0302bf38462c33ae7a4dfe244a7f3a))

### Features

- **activity:** activity service and spinner component ([074df7c](https://github.com/infra-geo-ouverte/igo2-lib/commit/074df7c5d4ebfe8a8bf796aca0ec79f2e825636b))
- **datasource:** split layers into datasource and layer ([743e2d9](https://github.com/infra-geo-ouverte/igo2-lib/commit/743e2d9ad92a519651b39c9bf264880931fad2e2))
- **form:** map field ([#44](https://github.com/infra-geo-ouverte/igo2-lib/issues/44)) ([7d1bf4b](https://github.com/infra-geo-ouverte/igo2-lib/commit/7d1bf4b18f70ce8473f3675f5e316e01bc3085f2))
- **map:** map browser binding directive ([61d9d26](https://github.com/infra-geo-ouverte/igo2-lib/commit/61d9d26b22a26902a6a1d127c9d9343858c2b962))
- **message:** message center ([#53](https://github.com/infra-geo-ouverte/igo2-lib/issues/53)) ([32955bd](https://github.com/infra-geo-ouverte/igo2-lib/commit/32955bdad955afdfba0130e0af65e532d42c8fa9))
- **overlay:** move some overlay directive stuff to the map to allow for more flexibility when overlaying stuf ([972bdb7](https://github.com/infra-geo-ouverte/igo2-lib/commit/972bdb797edc2a6bee105cb08982e9e071c6ddf3))
- **search:** add directive to pass search term in url param ([#40](https://github.com/infra-geo-ouverte/igo2-lib/issues/40)) ([6b7a9f0](https://github.com/infra-geo-ouverte/igo2-lib/commit/6b7a9f0c46209a7cdbd0977a1d77e0b91072781c))
- **search:** add icherche search source ([f88d85f](https://github.com/infra-geo-ouverte/igo2-lib/commit/f88d85fe63d1da2af29784b8185e74a0bcd6115f))
- **search:** datasource search source ([3eab198](https://github.com/infra-geo-ouverte/igo2-lib/commit/3eab198c46b25605944be9c3d2c3f8f4b0f59397))
- **vector layer:** add style to show points ([750591d](https://github.com/infra-geo-ouverte/igo2-lib/commit/750591d35c4cff5a2121b35667098a872f9a6b00))
- **watcher:** map and layers status ([#51](https://github.com/infra-geo-ouverte/igo2-lib/issues/51)) ([4ec49ba](https://github.com/infra-geo-ouverte/igo2-lib/commit/4ec49ba531e26398ea4a50e8d5e7a8e7e44783d2))

## [0.3.3](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.3.2...0.3.3) (2017-05-04)

### Bug Fixes

- **map:** don't throw error when setting/getting a map in the map service ([6870a6b](https://github.com/infra-geo-ouverte/igo2-lib/commit/6870a6be26e585505d79ae82011fdb04f2231e56))

## [0.3.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.3.1...0.3.2) (2017-05-04)

## [0.3.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.3.0...0.3.1) (2017-05-03)

# [0.3.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.2.2...0.3.0) (2017-05-03)

### Bug Fixes

- **build:** fix forRoot imports ([199e5a3](https://github.com/infra-geo-ouverte/igo2-lib/commit/199e5a3e78677c2fbb50ae88dec1a39db1e44b8b))

### Features

- **print:** basic print tool ([#35](https://github.com/infra-geo-ouverte/igo2-lib/issues/35)) ([8ba1839](https://github.com/infra-geo-ouverte/igo2-lib/commit/8ba1839d70f30fdabb47d6726113b54ca5add1ee))
- **print:** handle some print CORS errors and disable the print button while printing ([#37](https://github.com/infra-geo-ouverte/igo2-lib/issues/37)) ([e20f5d6](https://github.com/infra-geo-ouverte/igo2-lib/commit/e20f5d6de34696422c4d27fd1f0ac55c6e7b5d0e))
- **print:** wait for tiles to be properly loaded before printing and don't crash on CORS error ([76a679f](https://github.com/infra-geo-ouverte/igo2-lib/commit/76a679f78b506efe6f9b95922f9a3f28301328d6))

## [0.2.2](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.2.1...0.2.2) (2017-05-01)

### Bug Fixes

- **slider:** add hammerjs to support touch gestures ([7c39172](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c39172573d47285b3c561570ab442e0c2574a53))

### Features

- **legend:** layer legend html style ([493bc5b](https://github.com/infra-geo-ouverte/igo2-lib/commit/493bc5b26d4def9485a0bf75f6367ca437256d92))
- **wfs:** support wfs layers and vector styling ([#34](https://github.com/infra-geo-ouverte/igo2-lib/issues/34)) ([c7d9136](https://github.com/infra-geo-ouverte/igo2-lib/commit/c7d913656b8d950a20ce05d20c6b334410ea935f))

## [0.2.1](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.2.0...0.2.1) (2017-05-01)

# [0.2.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/0.1.0...0.2.0) (2017-05-01)

### Bug Fixes

- **layer:** fix layer list push strategy issue ([eaf070d](https://github.com/infra-geo-ouverte/igo2-lib/commit/eaf070daba64054e43130740274c4612d1994f87))
- **overlay:** fix errors when trying to overlay a feature withotu geometry ([81407e6](https://github.com/infra-geo-ouverte/igo2-lib/commit/81407e688ff8c42b0c937cc58f41ed059e13cba5))
- **tool:** fix toolbox animation issue ([9bf86f8](https://github.com/infra-geo-ouverte/igo2-lib/commit/9bf86f8e87a327b7160a0308ecbc45049b8b7fd2))

### Features

- **context:** add context tool ([#30](https://github.com/infra-geo-ouverte/igo2-lib/issues/30)) ([9a961bc](https://github.com/infra-geo-ouverte/igo2-lib/commit/9a961bca6cbebe7f5c5f845992c2f2805b459f9c))
- **context:** add keepCurrentView options ([29ba202](https://github.com/infra-geo-ouverte/igo2-lib/commit/29ba20223555e6f3e4c06b8313eca0fe59824a45))
- **feature list:** always focus the first query item ([ab41e69](https://github.com/infra-geo-ouverte/igo2-lib/commit/ab41e694d769cdbe76d90cef88f31c4b2f12b210))
- **layr legend:** do not toggle the legend when a layer is set visible ([2114580](https://github.com/infra-geo-ouverte/igo2-lib/commit/2114580ac946a450214470a8475508d3221c84a1))

# [0.1.0](https://github.com/infra-geo-ouverte/igo2-lib/compare/193d8797720eda90ca7d2b00b9e50a410c409dde...0.1.0) (2017-04-27)

### Bug Fixes

- **build:** fix build prod with aot ([74285fc](https://github.com/infra-geo-ouverte/igo2-lib/commit/74285fc6bb9574f5913b6ed35ba8981c02594914))
- **feature:** fix focus method ([7485261](https://github.com/infra-geo-ouverte/igo2-lib/commit/7485261159c88266edd47a646e3fb7e426fc3bbd))
- **icon:** fix path assets ([41808b7](https://github.com/infra-geo-ouverte/igo2-lib/commit/41808b78caceec989292e0505b258dcfa07e82d9))
- **language:** fix this missing ([fc7d52b](https://github.com/infra-geo-ouverte/igo2-lib/commit/fc7d52b4080697edd743c92408de0ac134388b22))
- **layer list:** fix layer list reordering issue ([926d644](https://github.com/infra-geo-ouverte/igo2-lib/commit/926d644d50243d10be07bb2acb82807138ef73e7))
- **message:** add missing file with message types ([631e23f](https://github.com/infra-geo-ouverte/igo2-lib/commit/631e23f6c2903697a695b2d374fc6f050cb7250c))
- **search bar:** fix clear button and missing deps ([7f58664](https://github.com/infra-geo-ouverte/igo2-lib/commit/7f586645eebde8ab7d282ce52711488c6a09cc9e))
- **search bar:** search bar uses 100% of the width ([7c97cee](https://github.com/infra-geo-ouverte/igo2-lib/commit/7c97cee1cd623cf7ec0bfe1b9155fbb4202b32ff))
- **search source:** remove test search source ([28a9b14](https://github.com/infra-geo-ouverte/igo2-lib/commit/28a9b143d3123113a5d7f0a597e9cc618f7c1ff3))
- **test:** test only src directory ([e66d998](https://github.com/infra-geo-ouverte/igo2-lib/commit/e66d9986d3bed49a4d015ae2a3bbb94707ce9e13))
- **toolbox:** fix toolbox component init issue ([001cfa4](https://github.com/infra-geo-ouverte/igo2-lib/commit/001cfa4bc63ed3ed16f99374d9189192eb2f395b))
- **translate:** add translate providers in lib ([8b0509e](https://github.com/infra-geo-ouverte/igo2-lib/commit/8b0509e0aeb45241f45c1e9dee884241b516f1b0))
- unused imports ([4692cae](https://github.com/infra-geo-ouverte/igo2-lib/commit/4692cae876bb74736286aa2b16b8259d3e619596))

### Features

- **animation:** export toolbox animation ([7f8019f](https://github.com/infra-geo-ouverte/igo2-lib/commit/7f8019f4f65a09fbe9f398d5f9e508a808c34ae4))
- **context:** context service ([#20](https://github.com/infra-geo-ouverte/igo2-lib/issues/20)) ([a17054c](https://github.com/infra-geo-ouverte/igo2-lib/commit/a17054c34f9044e49e5a396a444a150483aac3b6))
- **feature-list:** split feature list into two components to allow more customization ([#15](https://github.com/infra-geo-ouverte/igo2-lib/issues/15)) ([aef0e24](https://github.com/infra-geo-ouverte/igo2-lib/commit/aef0e24ecb7ea2f975031493d959770834183748))
- **language:** add support language in lib ([#13](https://github.com/infra-geo-ouverte/igo2-lib/issues/13)) ([383e475](https://github.com/infra-geo-ouverte/igo2-lib/commit/383e47537f44670cb1c0cc77ca6ab12fccc5adee))
- **media:** media service ([#18](https://github.com/infra-geo-ouverte/igo2-lib/issues/18)) ([39655a6](https://github.com/infra-geo-ouverte/igo2-lib/commit/39655a629e4b1b11a62b8fa64205c8440762e704))
- **search bar:** better display of the search bar clear button ([#17](https://github.com/infra-geo-ouverte/igo2-lib/issues/17)) ([1747c1c](https://github.com/infra-geo-ouverte/igo2-lib/commit/1747c1c98e422f7a942155521cf5c0f8498becb2))
- **search bar:** search bar component ([193d879](https://github.com/infra-geo-ouverte/igo2-lib/commit/193d8797720eda90ca7d2b00b9e50a410c409dde))
- **search service:** search service and nominatim search source ([b2a191d](https://github.com/infra-geo-ouverte/igo2-lib/commit/b2a191dd6acff317176e279834b106e28694c015))
- **search tool:** search tool ([f1ee400](https://github.com/infra-geo-ouverte/igo2-lib/commit/f1ee40051b2066d22a275e68d37e303b0abe684c))
- **search:** add search options support ([#22](https://github.com/infra-geo-ouverte/igo2-lib/issues/22)) ([f77766a](https://github.com/infra-geo-ouverte/igo2-lib/commit/f77766a179dedd0eb4eacd492a0dbec1febe9428))
- **sidenav:** shim directive to prevent the default focus behavior ([eaea180](https://github.com/infra-geo-ouverte/igo2-lib/commit/eaea180ccdfeb3bab0da8f4a2275dee1f070d6ff))
- **time filter:** time filter module ([#5](https://github.com/infra-geo-ouverte/igo2-lib/issues/5)) ([d857c4e](https://github.com/infra-geo-ouverte/igo2-lib/commit/d857c4e8e11641530c7a03a1b259da9e004f35cc))
- **toolbar:** toolbar selected item input ([#27](https://github.com/infra-geo-ouverte/igo2-lib/issues/27)) ([a808e93](https://github.com/infra-geo-ouverte/igo2-lib/commit/a808e9352a93500d166008240660b0f6f3860b78))
- **tool:** some tools and working toolbox ([#25](https://github.com/infra-geo-ouverte/igo2-lib/issues/25)) ([72422ee](https://github.com/infra-geo-ouverte/igo2-lib/commit/72422ee15d31eaacbb4027294ef76325a69a9f35))
- **tool:** tool module with toolbar, toolbox and tool service ([#14](https://github.com/infra-geo-ouverte/igo2-lib/issues/14)) ([f513261](https://github.com/infra-geo-ouverte/igo2-lib/commit/f513261e4b0fc103bd4a8b36c0a72673ceee4a3e))
- **tool:** unselectTool method on tool service ([744da24](https://github.com/infra-geo-ouverte/igo2-lib/commit/744da2474448a03258b856ab3346042e19a9d439))
- **translate:** add translate support ([8c9e41a](https://github.com/infra-geo-ouverte/igo2-lib/commit/8c9e41a2e5fc0066704a326ed380e9bc654446d6))
- **translate:** improvement for translate module ([0871eb6](https://github.com/infra-geo-ouverte/igo2-lib/commit/0871eb68144dd6fe8b18655d1fba791b65804084))
