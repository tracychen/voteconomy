package com.example.voteconomy.ui.data


interface Repo {
    suspend fun getAllPolls(): Result<List<Poll>>
    suspend fun createPoll(poll:Poll): Result<Boolean>
}