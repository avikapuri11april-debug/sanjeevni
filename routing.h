#ifndef ROUTING_H
#define ROUTING_H

#include <bits/stdc++.h>
using namespace std;

map<string,int> dijkstra(string src) {
    map<string,int> dist;

    for(auto it:graph)
        dist[it.first] = INT_MAX;

    priority_queue<pair<int,string>, vector<pair<int,string>>, greater<pair<int,string>>> pq;

    dist[src] = 0;
    pq.push({0,src});

    while(!pq.empty()) {
        auto t = pq.top(); pq.pop();
        string node = t.second;

        for(auto nbr:graph[node]) {
            if(dist[node] + nbr.second < dist[nbr.first]) {
                dist[nbr.first] = dist[node] + nbr.second;
                pq.push({dist[nbr.first], nbr.first});
            }
        }
    }

    return dist;
}

// path printing
void printPath(string src, string dest) {

    map<string,int> dist;
    map<string,string> parent;

    for(auto it:graph) {
        dist[it.first] = INT_MAX;
        parent[it.first] = "";
    }

    priority_queue<pair<int,string>, vector<pair<int,string>>, greater<pair<int,string>>> pq;

    dist[src] = 0;
    pq.push({0,src});

    while(!pq.empty()) {
        auto t = pq.top(); pq.pop();
        string node = t.second;

        for(auto nbr:graph[node]) {
            if(dist[node] + nbr.second < dist[nbr.first]) {
                dist[nbr.first] = dist[node] + nbr.second;
                parent[nbr.first] = node;
                pq.push({dist[nbr.first], nbr.first});
            }
        }
    }

    cout << "Path: ";
    string cur = dest;

    while(cur != "") {
        cout << cur << " ";
        cur = parent[cur];
    }

    cout << endl;
    cout << "Distance: " << dist[dest] << endl;
}

#endif