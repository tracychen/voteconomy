package com.example.voteconomy.ui.data

data class Poll(val pollId: String = "",
                val userName: String = "",
                val userPhoto: String = "",
                val question: String = "",
                val options: List<Option> = emptyList())

data class Option(val votes: Int = 0, val name: String = "")