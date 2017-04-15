///<reference path="../lib/ts-types/knockout.d.ts"/>
import { GithubClient } from './FileSystem/GithubClient';
import { GithubFileSystem } from './FileSystem/GithubFs';
import { IFileSystem, IFsItem } from './FileSystem/Interfaces';
import { FsUri } from './FileSystem/FsUri';
import { LocalFileSystem } from './FileSystem/LocalFs';
import { RemoteFileSystem } from './FileSystem/RemoteFs';
import { FsSelector } from './FileSystem/FsSelector';
import * as ko from "knockout";

var queryParams: { access_token?: string, secret?: string } = {};
location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => queryParams[x[0]] = x[1]);

var fs = new FsSelector();
fs.addFs(new LocalFileSystem());

var remoteFs = new RemoteFileSystem();
remoteFs.mappings["127.0.0.1:8001/default"] = { secret: queryParams.secret };
fs.addFs(remoteFs);

var githubClient = new GithubClient(queryParams.access_token);
var githubFs = new GithubFileSystem(githubClient);
fs.addFs(githubFs);

console.log(ko);

var viewModel = {
    treeRoot: ko.observableArray()
};

class TreeElement {
    public name: KnockoutObservable<string>;
    public children: KnockoutObservableArray<TreeElement>;
    public isOpen: KnockoutObservable<boolean>;

    constructor(name: string, children: TreeElement[] = []) {
        this.name = ko.observable(name);
        this.isOpen = ko.observable(false);
        this.children = ko.observableArray(children);
    }

    openCloseNode() {
        this.isOpen(!this.isOpen());
    }
}

var tree = [
    new TreeElement("Russia", [
        new TreeElement("Moscow")
    ]),
    new TreeElement("Germany"),
    new TreeElement("United States",
        [
            new TreeElement("Atlanta"),
            new TreeElement("New York", [
                new TreeElement("Harlem"),
                new TreeElement("Central Park")
            ])
        ]),
    new TreeElement("Canada", [
        new TreeElement("Toronto2")
    ])
];

viewModel.treeRoot(tree);
ko.applyBindings(viewModel);

//['local:///folder/', 'remote://127.0.0.1:8001/default/folder/', 'github://koczkatamas/kaitai_struct_formats/archive/']
//    .forEach(uri => fs.list(uri).then(items => console.log(items.map(item => `${item.uri.uri} (${item.uri.type})`))));

