package main

import (
    "crypto/sha1"
    "fmt"
    "basen"
    "strings"
    "sync"
    "gopkg.in/redis.v3"
    "strconv"
    "encoding/hex"
)

func main() {
    var wg sync.WaitGroup
    nbWorker := 4
    start := strings.Repeat("a", basen.Length())
    end := strings.Repeat("z", basen.Length())
    step := basen.Decode(end) / nbWorker
    client := redis.NewClient(&redis.Options{
       Addr:     "localhost:6379",
       Password: "", // no password set
       DB:       0,  // use default D   B
    })

    wg.Add(nbWorker)

    for i:=0 ; i < nbWorker ; i++ {
        if i == nbWorker-1 {
            go write(start, end, client, &wg)
        } else {
            go write(start, basen.Encode(basen.Decode(start)+step), client, &wg)
        }
        start = basen.Encode(basen.Decode(start)+step)
    }

     wg.Wait()
}

func write(start string, end string, client *redis.Client, wg *sync.WaitGroup) {
    fmt.Printf("%s => %s\n", start, end)
    for i := start ; i != end ; i = basen.Encode(basen.Decode(i)+1) {
        data := sha1.Sum([]byte(i))
        err := client.Set(i, hex.EncodeToString(data[:]), 0).Err()
        if err != nil {
            panic(err)
        }
    }
    lastData := sha1.Sum([]byte(end))
    err := client.Set(end, hex.EncodeToString(lastData[:]), 0).Err()
    if err != nil {
        panic(err)
    }
    fmt.Printf("finish\n")
    defer wg.Done()
}
