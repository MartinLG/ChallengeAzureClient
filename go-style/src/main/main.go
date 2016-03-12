package main

import (
    // "crypto/sha1"
    "fmt"
    "basen"
)

func main() {
    start := "aaaaaa"
    end := "zzzzzz"
    for i := start ; i != end ; i = basen.Encode(basen.Decode(i)+1) {
        fmt.Printf("%d => %s\n", basen.Decode(i), i)
    }
}
