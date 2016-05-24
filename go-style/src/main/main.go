package main

import (
    "crypto/sha1"
    "fmt"
    "basen"
    "strings"
    "sync"
    "gopkg.in/redis.v3"
    "encoding/hex"
)

func main() {
    var wg sync.WaitGroup
    nbWorker := 24
    start := strings.Repeat("a", basen.Length())
    end := strings.Repeat("z", basen.Length())
    step := basen.Decode(end) / nbWorker
    fmt.Printf("Size = %d \n", basen.Decode(end) + 1)
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
    var length int
    nbSetInRedis := (basen.Decode(end) - basen.Decode(start)) / 5
    if nbSetInRedis % 2 == 0 {
        length = nbSetInRedis
    } else {
        length = nbSetInRedis + 1
    }
    fmt.Printf("%s => %s \t nbSetInRedis = %d \n", start, end, length)
    buffer := make([]string,  length)
    indexBuffer := 0
    for i := start ; basen.Decode(i) <= basen.Decode(end) ; i = basen.Encode(basen.Decode(i)+1) {
        data := sha1.Sum([]byte(i))
        buffer[indexBuffer] = i
        indexBuffer++
        buffer[indexBuffer] = hex.EncodeToString(data[:])
        indexBuffer++
        if indexBuffer > len(buffer) - 1 {
            err := client.MSet(buffer[:]...).Err()
            if err != nil {
                panic(err)
            }
            indexBuffer = 0
        }
    }
    if indexBuffer != 0 {
        err := client.MSet(buffer[0:indexBuffer]...).Err()
        if err != nil {
            panic(err)
        }
    }
    fmt.Printf("finish\n")
    defer wg.Done()
}
