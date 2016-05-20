package basen

import (
    "strings"
    "math"
    //"fmt"
)

const (
    charset = "abcdefghijklmnopqrstuvwxyz"
    MAX_SAFE_INTEGER = 7378697
    length = 4
)

func Length() int {
    return length
}

func Decode(id string) int {
    if len(id) != length {
        panic("length no repected")
    }
    num := 0
    place := 0

    for i := len(id)-1 ; i >= 0 ; i-- {
        character := id[i]
        charIdx := strings.IndexAny(charset, string(character))
        var numToAdd float64

        if place > 0 {
            numToAdd = math.Pow(float64(len(charset)), float64(place)) * float64(charIdx)
        } else {
            numToAdd = float64(charIdx)
        }

        if numToAdd == -1 {
            panic("unknown")
        } else {
            num += int(numToAdd)
        }

        place++
    }

    if num >= MAX_SAFE_INTEGER {
        panic("decoded value exceeds Number.MAX_SAFE_INTEGER")
    }

    return num
}

func Encode(num int) string {
    if num < 0 {
        panic("value to be encoded must be positive")
    }

    n := num
    places := 0
    var out string
    var result int
    var remainder int

    for i:=0 ; i < length ; i++ {
        result = int(math.Floor(float64(n) / math.Pow(float64(len(charset)), float64(places))))
        remainder = result % len(charset)
        if len(out) <= 0 {
            out = string(charset[remainder])
        } else {
            out = string(charset[remainder]) + out
        }

        places++
    }

    return out
}
