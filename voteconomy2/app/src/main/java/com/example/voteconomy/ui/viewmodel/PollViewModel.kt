package com.example.voteconomy.ui.viewmodel


import androidx.lifecycle.*
import com.example.voteconomy.ui.data.Poll
import com.example.voteconomy.ui.data.Repo
import com.example.voteconomy.ui.data.Result
import kotlinx.coroutines.Dispatchers

class PollViewModel(private val repo: Repo) : ViewModel() {

    private val createPollMutable = MutableLiveData<Poll>()

    val fetchAllPolls = liveData(Dispatchers.IO) {
        emit(Result.Loading())
        try {
            emit(repo.getAllPolls())
        } catch (e: Exception) {
            emit(Result.Failure(e))
        }
    }

    fun setPoll(poll: Poll){
        createPollMutable.value = poll
    }
    val createPoll = createPollMutable.switchMap {
        liveData(Dispatchers.IO) {
            emit(Result.Loading())
            try {
                emit(repo.createPoll(it))
            } catch (e: Exception) {
                emit(Result.Failure(e))
            }
        }
    }


}

class PollViewModelFactory(private val repo: Repo) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return modelClass.getConstructor(Repo::class.java).newInstance(repo)
    }
}