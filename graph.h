#ifndef GRAPH_H
#define GRAPH_H

#include <bits/stdc++.h>
using namespace std;

unordered_map<string, vector<pair<string,int>>> graph;

void addEdge(string u, string v, int w) {
    graph[u].push_back({v,w});
    graph[v].push_back({u,w});
}

void createGraph() {
    addEdge("A","B",4);
    addEdge("A","C",2);
    addEdge("B","D",5);
    addEdge("C","D",8);
    addEdge("C","E",10);
    addEdge("D","E",2);

    // extra nodes
    addEdge("E","F",3);
    addEdge("F","G",6);
    addEdge("B","G",7);
}

// dynamic location
void addNewLocation(string loc) {
    if(graph.find(loc) == graph.end()) {
        cout << "New location added\n";
        graph[loc].push_back({"A",5});
        graph["A"].push_back({loc,5});
    }
}

#endif