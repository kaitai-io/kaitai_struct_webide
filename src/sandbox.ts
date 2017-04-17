///<reference path="../lib/ts-types/vue/vue.d.ts" />
import { GithubClient } from './FileSystem/GithubClient';
import { GithubFileSystem } from './FileSystem/GithubFileSystem';
import { LocalFileSystem } from './FileSystem/LocalFileSystem';
import { RemoteFileSystem } from './FileSystem/RemoteFileSystem';
import { StaticFileSystem } from './FileSystem/StaticFileSystem';
import { IFileSystem, IFsItem, FsItem } from './FileSystem/Common';
import { FsUri } from './FileSystem/FsUri';
import { FsSelector } from './FileSystem/FsSelector';
import * as Vue from 'vue';
declare var kaitaiFsFiles: string[];

function fsTest() {
    var queryParams: { access_token?: string; secret?: string } = {};
    location.search.substr(1).split('&').map(x => x.split('=')).forEach(x => (<any>queryParams)[x[0]] = x[1]);

    var fs = new FsSelector();
    fs.addFs(new LocalFileSystem());

    var remoteFs = new RemoteFileSystem();
    remoteFs.mappings["127.0.0.1:8001/default"] = { secret: queryParams.secret };
    fs.addFs(remoteFs);

    var githubClient = new GithubClient(queryParams.access_token);
    var githubFs = new GithubFileSystem(githubClient);
    fs.addFs(githubFs);

    ['local:///folder/', 'remote://127.0.0.1:8001/default/folder/', 'github://koczkatamas/kaitai_struct_formats/archive/']
        .forEach(uri => fs.list(uri).then(items => console.log(items.map(item => `${item.uri.uri} (${item.uri.type})`))));
}



var staticFs = new StaticFileSystem();
kaitaiFsFiles.forEach(fn => staticFs.write("static://" + fn, new ArrayBuffer(0)));

staticFs.list("static://formats/").then(x => console.log(x.map(y => y.uri.uri)));


var data = {
    name: 'My Tree39',
    open: true,
    children: [
        { name: 'hello' },
        { name: 'wat' },
        {
            name: 'child folder',
            open: false,
            children: [
                {
                    name: 'child folder',
                    open: false,
                    children: [
                        { name: 'hello' },
                        { name: 'wat' }
                    ]
                },
                { name: 'hello' },
                { name: 'wat' },
                {
                    name: 'child folder',
                    open: false,
                    children: [
                        { name: 'hello' },
                        { name: 'wat' }
                    ]
                }
            ]
        }
    ]
};

// define the item component
Vue.component('item', {
    template: '#item-template',
    props: {
        model: Object
    },
    computed: {
        isFolder(){ return this.model.children && this.model.children.length; }
    },
    methods: {
        toggle() {
            if (this.isFolder)
                this.model.open = !this.model.open;
        },
        changeType() {
            if (!this.isFolder) {
                Vue.set(this.model, 'children', []);
                this.addChild();
                this.model.open = true;
            }
        },
        addChild() {
            this.model.children.push({
                name: 'new stuff'
            });
        }
    }
});

Vue.config.devtools = true;

// boot up the demo
var demo = new Vue({
    el: '#tree',
    data: {
        treeData: data
    }
});